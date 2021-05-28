pragma solidity >=0.6.0 <0.7.0;

import "./SupplyChainAsNFT.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SupplyChainFactory is AccessControl {
    event SupplyChainCreated(string name, string symbol, uint256 tokenLimit);

    constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // name + address for
    SupplyChainAsNFT[] _supplyChains;

    function addSupplyChain(
        string memory name,
        string memory symbol,
        uint256 tokenLimit
    ) public returns (address) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "SupplyChainFactory: must have default admin role to add supplyChain"
        );

        SupplyChainAsNFT supplyChain = new SupplyChainAsNFT(name, symbol);
        supplyChain.setTokenLimit(tokenLimit);

        _supplyChains.push(supplyChain);

        emit SupplyChainCreated(name, symbol, tokenLimit);

        return address(supplyChain);
    }
}
