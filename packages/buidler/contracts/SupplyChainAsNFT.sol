pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./ERC721MinterPauser.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SupplyChainAsNFT is ERC721MinterPauser {
    using SafeMath for uint256;

    event TokenLimitSet(uint256 tokenLimit);
    event StageStarted(uint256 token, uint256 stage);
    event StageCompleted(uint256 token, uint256 stage);
    event FinalStageCompleted(uint256 token, uint256 stage);
    event FinalStageReady(uint256 token, uint256 stage);
    event StageAdded(uint256 id, string name);
    event TokenStageDocumentAdded(
        uint256 token,
        uint256 stage,
        string documentHash
    );

    event SupplierAdded(uint256 stage, address addr);
    event SupplierPaid(
        address indexed supplier,
        uint256 token,
        uint256 stage,
        uint256 amount
    );
    event SupplierWithdrewBalance(address receiver, uint256 amount);

    mapping(address => uint256) public OwedBalances;

    bool private tokenLimitSet;
    uint256 private _stageCount;

    mapping(uint256 => ChainStage) private _chainStages;

    mapping(uint256 => address[]) private _chainStageSignatories;
    mapping(uint256 => address[]) private _chainStageSuppliers;

    mapping(uint256 => mapping(uint256 => string[]))
        private _chainStageDocuments;
    mapping(uint256 => mapping(address => bool))
        private _chainStageSignatoriesExist;
    mapping(uint256 => mapping(address => bool))
        private _chainStageSuppliersExist;
    mapping(uint256 => mapping(uint256 => mapping(string => bool)))
        private _chainStageDocumentsExist;

    mapping(uint256 => mapping(uint256 => ChainStageState))
        private _tokenStageStates;

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

    struct AddressStageView {
        uint256 token;
        uint256 stage;
        uint256 supplierFee;
    }

    constructor(
        string memory name,
        string memory symbol,
        address owner
    ) public ERC721MinterPauser(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, owner);
        _setupRole(MINTER_ROLE, owner);
    }

    /// @notice Default fallback for non-data related deposits
    /// @dev no funds should be accepted to this contract
    fallback() external payable {
        revert("");
    }

    /// @notice Default receive for non-data related deposits
    /// @dev no funds should be accepted to this contract
    receive() external payable {
        revert("");
    }

    /// @notice Withdraws the balance associated to the owner
    /// @dev deliberately not checking isOwner as you may have been removed but should still get your funds
    /// @dev setting balance to zero before send to prevent re-entry in case it is a contract address
    function withdraw() public {
        require(OwedBalances[_msgSender()] > 0);

        uint256 balanceToSend = OwedBalances[_msgSender()];
        OwedBalances[_msgSender()] = 0;

        _msgSender().transfer(balanceToSend);

        emit SupplierWithdrewBalance(_msgSender(), balanceToSend);
    }

    function allStagesHaveSuppliersAndSignatories() private view {
        for (uint256 i = 1; i <= _stageCount; i++) {
            require(_chainStageSuppliers[i].length > 0, "missing suppliers");
            require(
                _chainStageSignatories[i].length > 0,
                "missing signatories"
            );
        }
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

    function getStageSuppliers(uint256 stage)
        public
        view
        returns (address[] memory stages)
    {
        require(stage > 0 && stage <= _stageCount, "Out of bounds");

        return _chainStageSuppliers[stage];
    }

    function getStageSignatories(uint256 stage)
        public
        view
        returns (address[] memory stages)
    {
        return _chainStageSignatories[stage];
    }

    function getTokenStageDocuments(uint256 token, uint256 stage)
        public
        view
        returns (string[] memory documents)
    {
        require(stage > 0 && stage <= _stageCount, "Out of bounds");

        return _chainStageDocuments[token][stage];
    }

    function getSignatoryView()
        public
        view
        returns (AddressStageView[] memory states)
    {
        uint256 totalSupply = totalSupply();

        uint256 resultCount = 0;

        for (uint256 token = 1; token <= totalSupply; token++) {
            for (uint256 stage = 1; stage <= _stageCount; stage++) {
                if (
                    _tokenStageStates[token][stage].signatory == _msgSender() &&
                    !_tokenStageStates[token][stage].isComplete
                ) {
                    resultCount++;
                }
            }
        }

        AddressStageView[] memory results = new AddressStageView[](0);

        if (resultCount == 0) {
            return results;
        }

        results = new AddressStageView[](resultCount);
        uint256 index = 0;

        for (uint256 token = 1; token <= totalSupply; token++) {
            for (uint256 stage = 1; stage <= _stageCount; stage++) {
                if (
                    _tokenStageStates[token][stage].signatory == _msgSender() &&
                    !_tokenStageStates[token][stage].isComplete
                ) {
                    results[index].stage = stage;
                    results[index].token = token;
                    results[index].supplierFee = _tokenStageStates[token][stage]
                        .supplierFee;
                    index++;
                }
            }
        }

        states = results;
    }

    function getSupplierView()
        public
        view
        returns (AddressStageView[] memory states)
    {
        uint256 totalSupply = totalSupply();

        uint256 resultCount = 0;

        for (uint256 token = 1; token <= totalSupply; token++) {
            for (uint256 stage = 1; stage <= _stageCount; stage++) {
                if (
                    _tokenStageStates[token][stage].supplier == _msgSender() &&
                    !_tokenStageStates[token][stage].isComplete
                ) {
                    resultCount++;
                }
            }
        }

        AddressStageView[] memory results = new AddressStageView[](0);

        if (resultCount == 0) {
            return results;
        }

        results = new AddressStageView[](resultCount);
        uint256 index = 0;

        for (uint256 token = 1; token <= totalSupply; token++) {
            for (uint256 stage = 1; stage <= _stageCount; stage++) {
                if (
                    _tokenStageStates[token][stage].supplier == _msgSender() &&
                    !_tokenStageStates[token][stage].isComplete
                ) {
                    results[index].stage = stage;
                    results[index].token = token;
                    results[index].supplierFee = _tokenStageStates[token][stage]
                        .supplierFee;
                    index++;
                }
            }
        }

        states = results;
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
        require(_stageCount >= stage, "no stage");
        require(currentTokenMintCount >= token, "no token");
        require(!_tokenStageStates[token][stage].hasStarted, "Stage started");
        require(!_tokenStageStates[token][stage].isComplete, "Stage complete");

        if (stage == 1) {
            require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "not owner");
        }

        require(_chainStageSignatoriesExist[stage][signatory], "not signatory");
        require(_chainStageSuppliersExist[stage][supplier], "not supplier");

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
                    "not paid"
                );

                completeStage(token, previousStage);
            } else {
                require(
                    _tokenStageStates[token][previousStage].isComplete,
                    "not complete"
                );
            }
        }

        _tokenStageStates[token][stage].supplier = supplier;
        _tokenStageStates[token][stage].signatory = signatory;
        _tokenStageStates[token][stage].supplierFee = supplierFee;
        _tokenStageStates[token][stage].hasStarted = true;

        emit StageStarted(token, stage);
    }

    function completeFinalStage(uint256 token, uint256 stage) public payable {
        require(_stageCount == stage, "not final");
        require(currentTokenMintCount >= token, "no token");
        require(_tokenStageStates[token][stage].hasStarted, "not started");
        require(!_tokenStageStates[token][stage].isComplete, "is complete");
        require(
            _chainStageSignatoriesExist[stage][_msgSender()],
            "incomplete signatories"
        );
        require(
            _tokenStageStates[token][stage].supplierFee == msg.value,
            "not paid"
        );

        completeStage(token, stage);

        emit FinalStageCompleted(token, stage);
    }

    function completeStage(uint256 token, uint256 stage) private {
        _tokenStageStates[token][stage].isComplete = true;

        if (_tokenStageStates[token][stage].supplierFee > 0) {
            OwedBalances[
                _tokenStageStates[token][stage].supplier
            ] = OwedBalances[_tokenStageStates[token][stage].supplier].add(
                msg.value
            );

            emit SupplierPaid(
                _tokenStageStates[token][stage].supplier,
                token,
                stage,
                msg.value
            );
        }

        emit StageCompleted(token, stage);

        if (stage == _stageCount - 1) {
            emit FinalStageReady(token, _stageCount);
        }
    }

    function addStageSupplier(uint256 stage, address addr) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "not admin");
        require(stage > 0 && stage <= _stageCount, "Out of bounds");

        _chainStageSuppliers[stage].push(addr);
        _chainStageSuppliersExist[stage][addr] = true;

        emit SupplierAdded(stage, addr);
    }

    function addStage(string memory name) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "not admin");
        require(currentTokenMintCount == 0, "tokens minted");

        _chainStages[_stageCount].id = _stageCount + 1;
        _chainStages[_stageCount].name = name;
        _stageCount++;

        emit StageAdded(_stageCount, name);
    }

    function addStageSignatory(uint256 stage, address addr) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "not admin");
        require(stage > 0 && stage <= _stageCount, "Out of bounds");

        _chainStageSignatories[stage].push(addr);
        _chainStageSignatoriesExist[stage][addr] = true;
    }

    function addTokenStageDocument(
        uint256 token,
        uint256 stage,
        string memory docHash
    ) public {
        require(_stageCount >= stage, "no stage");
        require(_tokenStageStates[token][stage].hasStarted, "not started");
        require(!_tokenStageStates[token][stage].isComplete, "stage completed");
        require(_chainStageSuppliersExist[stage][_msgSender()], "not supplier");

        require(
            !_chainStageDocumentsExist[token][stage][docHash],
            "document exists"
        );

        _chainStageDocuments[token][stage].push(docHash);
        _chainStageDocumentsExist[token][stage][docHash] = true;

        emit TokenStageDocumentAdded(token, stage, docHash);
    }

    function setTokenLimit(uint256 tokenLimit) public {
        require(tokenLimit > 0, "too low");
        require(tokenLimitSet == false, "limit set");
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "not admin");

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

            if (_tokenStageStates[token][1].hasStarted) {
                require(
                    _tokenStageStates[token][_stageCount].isComplete,
                    "incomplete"
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
