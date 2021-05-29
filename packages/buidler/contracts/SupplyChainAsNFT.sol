pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./ERC721MinterPauser.sol";

contract SupplyChainAsNFT is ERC721MinterPauser {
    event TokenLimitSet(uint256 tokenLimit);

    bool private tokenLimitSet;

    uint256 private _stageCount;

    mapping(uint256 => ChainStage) public _chainStages;

    mapping(uint256 => address[]) public _chainStageSignatories;
    mapping(uint256 => mapping(address => bool))
        public _chainStageSignatoriesExist;

    // tokenId -> stage->complete
    mapping(uint256 => mapping(uint256 => ChainStageState)) tokenStageStates;

    struct ChainStage {
        uint256 id;
        string name;
    }

    struct ChainStageState {
        bool isComplete;
        address signer;
        bool hasStarted;
    }

    constructor(string memory name, string memory symbol)
        public
        ERC721MinterPauser(name, symbol)
    {}

    function assignStage(
        uint256 tokenId,
        uint256 stage,
        address assignee
    ) public {
        require(currentTokenMintCount >= tokenId, "token does not exist");

        require(
            !tokenStageStates[tokenId][stage].isComplete,
            "The stage is already complete"
        );

        if (stage == 1) {
            require(
                hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
                "Only owners can assign first state"
            );
        }

        require(
            _chainStageSignatoriesExist[stage][assignee],
            "assignee is not in the collection of signatories"
        );
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

    function addStageSignatory(uint256 stage, address addr) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "SupplyChainAsNFT: must have default admin role to addStage"
        );

        require(
            currentTokenMintCount == 0,
            "Tokens have been minted, stages cannot be added"
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
        uint256 tokenId
    ) internal override(ERC721MinterPauser) {
        if (_stageCount > 0 && tokenStageStates[tokenId][0].hasStarted) {
            require(
                tokenStageStates[tokenId][_stageCount].isComplete,
                "not all stages are complete"
            );
        }

        super._beforeTokenTransfer(from, to, tokenId);
    }
}
