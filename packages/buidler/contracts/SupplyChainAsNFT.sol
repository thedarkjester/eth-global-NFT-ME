pragma solidity >=0.6.0 <0.7.0;

import "./ERC721MinterPauser.sol";

contract SupplyChainAsNFT is ERC721MinterPauser {
    event TokenLimitSet(uint256 tokenLimit);

    bool private tokenLimitSet;

    mapping(uint256 => ChainStage) public _chainStages;

    struct ChainStage {
        uint256 id;
        string name;
    }

    constructor(string memory name, string memory symbol)
        public
        ERC721MinterPauser(name, symbol)
    {}

    function setTokenLimit(uint256 tokenLimit) public {
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
}
