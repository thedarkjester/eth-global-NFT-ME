pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./SupplyChainAsNFT.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SupplyChainFactory is AccessControl {
    uint256 currentTokenMintCount;

    event SupplyChainCreated(
        string name,
        string symbol,
        uint256 tokenLimit,
        address supplyChainAddress
    );

    constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // name + address for supply chains
    SupplyChainAsNFT[] _supplyChains;

    /// @notice Retrieves a list of all the supply chain names and addresses
    /// @return names array
    /// @return addresses array
    function getSupplyChainList()
        public
        view
        returns (string[] memory names, address[] memory addresses)
    {
        string[] memory safeNames = new string[](_supplyChains.length);
        address[] memory workingAddresses = new address[](_supplyChains.length);

        for (uint256 i = 0; i < _supplyChains.length; i++) {
            if (!isSafeString(_supplyChains[i].name())) {
                safeNames[i] = "***";
            } else {
                safeNames[i] = _supplyChains[i].name();
            }

            workingAddresses[i] = address(_supplyChains[i]);
        }

        names = safeNames;
        addresses = workingAddresses;
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

    function addSupplyChain(
        string memory name,
        string memory symbol,
        uint256 tokenLimit
    ) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "SupplyChainFactory: must have default admin role to add supplyChain"
        );

        SupplyChainAsNFT supplyChain =
            new SupplyChainAsNFT(name, symbol, _msgSender());

        supplyChain.setTokenLimit(tokenLimit);

        _supplyChains.push(supplyChain);

        emit SupplyChainCreated(name, symbol, tokenLimit, address(supplyChain));
    }
}
