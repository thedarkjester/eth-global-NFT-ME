pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./ERC721MinterPauser.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SupplyChainAsNFT is ERC721MinterPauser {
    using SafeMath for uint256;

    event TokenLimitSet(uint256 tokenLimit);

    event StageStarted(uint256 token, uint256 stage);
    event StageCompleted(uint256 token, uint256 stage);

    event SupplierAdded(uint256 stage, address addr);
    event SupplierPaid(
        address indexed supplier,
        uint256 token,
        uint256 stage,
        uint256 amount
    );

    bool private tokenLimitSet;
    uint256 private _stageCount;

    mapping(uint256 => ChainStage) public _chainStages;
    mapping(address => uint256) public OwedBalances;

    mapping(uint256 => address[]) public _chainStageSignatories;
    mapping(uint256 => address[]) public _chainStageSuppliers;

    mapping(uint256 => mapping(address => bool))
        public _chainStageSignatoriesExist;

    mapping(uint256 => mapping(address => bool))
        public _chainStageSuppliersExist;

    // token -> stage-> complete
    mapping(uint256 => mapping(uint256 => ChainStageState)) _tokenStageStates;

    struct ChainStage {
        uint256 id;
        string name;
    }

    struct ChainStageState {
        uint256 supplierFee;
        bool hasStarted;
        bool isComplete;
        address supplier;
        address signatory;
    }

    constructor(
        string memory name,
        string memory symbol,
        address owner
    ) public ERC721MinterPauser(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, owner);
    }

    /// @notice Default fallback for non-data related deposits
    /// @dev no funds should be accepted to this contract
    fallback() external payable {
        revert("no can do");
    }

    /// @notice Default receive for non-data related deposits
    /// @dev no funds should be accepted to this contract
    receive() external payable {
        revert("no can do");
    }

    function getTokenStageState(uint256 token, uint256 stage)
        public
        view
        returns (ChainStageState memory state)
    {
        state = _tokenStageStates[token][stage];
    }

    function startStage(
        uint256 token,
        uint256 stage,
        address supplier,
        address signatory,
        uint256 supplierFee
    ) public payable {
        require(_stageCount >= stage, "stage does not exist");
        require(currentTokenMintCount >= token, "token does not exist");

        if (stage > 1) {
            require(
                !_tokenStageStates[token][stage - 1].isComplete,
                "The previous state is not complete"
            );
        }

        require(
            !_tokenStageStates[token][stage].hasStarted,
            "The stage is already started"
        );
        require(
            !_tokenStageStates[token][stage].isComplete,
            "The stage is already complete"
        );

        if (stage == 1) {
            require(
                hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
                "Only owners can assign first supplier"
            );
        }

        require(
            _chainStageSignatoriesExist[stage][signatory],
            "signatory is not in the collection of signatories"
        );

        require(
            _chainStageSuppliersExist[stage][supplier],
            "supplier is not in the collection of suppliers"
        );

        allStagesHaveSuppliersAndSignatories();

        if (stage > 1) {
            uint256 previousStage = stage - 1;

            if (
                _tokenStageStates[token][previousStage].signatory ==
                _msgSender()
            ) {
                require(
                    _tokenStageStates[token][previousStage].supplierFee ==
                        msg.value,
                    "The fee for the previous stage was not paid"
                );

                completeStage(token, previousStage);
            } else {
                require(
                    _tokenStageStates[token][previousStage].isComplete,
                    "The previous stage is not complete"
                );
            }
        }

        _tokenStageStates[token][stage].supplier = supplier;
        _tokenStageStates[token][stage].signatory = signatory;
        _tokenStageStates[token][stage].supplierFee = supplierFee;
        _tokenStageStates[token][stage].hasStarted = true;

        emit StageStarted(token, stage);
    }

    function allStagesHaveSuppliersAndSignatories() private view {
        for (uint256 i = 1; i <= _stageCount; i++) {
            require(
                _chainStageSuppliers[i].length > 0,
                "Not all stages have suppliers"
            );
            require(
                _chainStageSignatories[i].length > 0,
                "Not all stages have signatories"
            );
        }
    }

    function CompleteFinalStage(uint256 token, uint256 stage) public payable {
        require(_stageCount == stage, "This isn't the final stage");
        require(currentTokenMintCount >= token, "token does not exist");
        require(
            _tokenStageStates[token][stage].hasStarted,
            "The stage has not started"
        );
        require(
            !_tokenStageStates[token][stage].isComplete,
            "The stage is already complete"
        );
        require(
            _chainStageSignatoriesExist[stage][_msgSender()],
            "signatory is not in the collection of signatories"
        );
        require(
            _tokenStageStates[token][stage].supplierFee == msg.value,
            "The fee for the final stage was not paid"
        );

        completeStage(token, stage);
    }

    function completeStage(uint256 token, uint256 stage) private {
        emit StageCompleted(token, stage);

        _tokenStageStates[token][stage].isComplete = true;

        emit SupplierPaid(
            _tokenStageStates[token][stage].supplier,
            token,
            stage,
            msg.value
        );

        OwedBalances[_tokenStageStates[token][stage].supplier] = OwedBalances[
            _tokenStageStates[token][stage].supplier
        ]
            .add(msg.value);
    }

    function getStages() public view returns (string[] memory stages) {
        string[] memory safeStages = new string[](_stageCount);

        for (uint256 i = 0; i < _stageCount; i++) {
            if (!isSafeString(_chainStages[i].name)) {
                safeStages[i] = "***";
            } else {
                safeStages[i] = _chainStages[i].name;
            }
        }

        stages = safeStages;
    }

    /// @notice Retrieves a list of all the stage id, name, address
    /// @return names array
    /// @return addresses array
    // function getStageData()
    //     public
    //     view
    //     returns (string[] memory names, uint256[] memory ids)
    // {

    //     string[] memory safeNames = new string[](_chainStages.length);
    //     uint256[] memory ids = new uint256[](_chainStages.length);

    //     for (uint256 i = 0; i < _chainStages.length; i++) {
    //         if (!isSafeString(_supplyChains[i].name())) {
    //             safeNames[i] = "***";
    //         } else {
    //             safeNames[i] = _supplyChains[i].name();
    //         }

    //         workingAddresses[i] = address(_supplyChains[i]);
    //     }

    //     names = safeNames;
    //     addresses = workingAddresses;
    // }


    function addStageSupplier(uint256 stage, address addr) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "SupplyChainAsNFT: must have default admin role to addStageSupplier"
        );

        require(stage > 0 && stage <= _stageCount, "Out of stage bounds");

        _chainStageSuppliers[stage].push(addr);
        _chainStageSuppliersExist[stage][addr] = true;

        emit SupplierAdded(stage, addr);
    }
    function getStageSuppliers(uint256 stage)
        public
        view
        returns (address[] memory stages)
    {
        require(stage > 0 && stage <= _stageCount, "Out of stage bounds");

        return _chainStageSuppliers[stage];
    }

    function addStage(string memory name) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "SupplyChainAsNFT: must have default admin role to addStage"
        );

        require(
            currentTokenMintCount == 0,
            "Tokens have been minted, stages cannot be added"
        );

        _chainStages[_stageCount].id = _stageCount + 1;
        _chainStages[_stageCount].name = name;

        _stageCount++;
    }

    function addStageSignatory(uint256 stage, address addr) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "SupplyChainAsNFT: must have default admin role to addStageSignatory"
        );

        require(stage > 0 && stage <= _stageCount, "Out of stage bounds");

        _chainStageSignatories[stage].push(addr);
        _chainStageSignatoriesExist[stage][addr] = true;
    }

    function getStageSignatories(uint256 stage)
        public
        view
        returns (address[] memory stages)
    {
        return _chainStageSignatories[stage];
    }

    function setTokenLimit(uint256 tokenLimit) public {
        require(tokenLimit > 0, "You can't set the number less than one");
        require(
            tokenLimitSet == false,
            "You can't set the limit more than once"
        );
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "SupplyChainAsNFT: must have default admin role to set tokenLimit"
        );

        _tokenLimit = tokenLimit;
        tokenLimitSet = true;

        emit TokenLimitSet(tokenLimit);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 token
    ) internal override(ERC721MinterPauser) {
        if (_stageCount > 0) {
            allStagesHaveSuppliersAndSignatories();

            if (_tokenStageStates[token][0].hasStarted) {
                require(
                    _tokenStageStates[token][_stageCount].isComplete,
                    "not all stages are complete"
                );
                super._beforeTokenTransfer(from, to, token);
            }
        }
    }
    /// @notice Determine if the text is safe for use
    /// @dev Each character is individually checked
    /// @param str The string to interrogate
    /// @return Boolean indicating if the text contains unexpected characters
    function isSafeString(string memory str) private pure returns (bool) {
        bytes memory b = bytes(str);

        for (uint256 i; i < b.length; i++) {
            bytes1 char = b[i];
            if (
                !(char >= 0x30 && char <= 0x39) && //9-0
                !(char >= 0x41 && char <= 0x5A) && //A-Z
                !(char >= 0x61 && char <= 0x7A) && //a-z
                !(char == 0x2E) &&
                !(char == 0x20) // ." "
            ) return false;
        }
        return true;
    }
}
