# Supply chains minting tokens resulting in products as NFTs

The project was built with the idea of bringing quality and visibility to the production of real world or digital assets.

What this provides is a way for a business to manage their suppliers and internal quality when producing goods which they can ultimately provide to their customers. Some examples would be a luxury watch brand producing watches, 

There could be other potential applications for this with the supply chain portion running on a private or layer two solution that could create the NFT on the mainnet when ready.

The way it works is that a business/person would create the supply chain (an ERC721) token with a fixed limit of mintable tokens. 

We have a factory that creates supply chain ERC721 contract instances that can then be managed.

For each ERC721 contract created, a set of production stages would be configured (e.g. design, develop, quality check and package).

Each of these stages would then have suppliers or workers configured who may/may not have a fee associated to that stage. New suppliers can be added at any time. 

Additionally per stage, a set of signatories or "approvers" would be configured so that each stage would have oversight.

Once a token is minted, or an instance of the product created, the contract owner can kick off the supply chain by assigning the first stage someone supply the stage, the cost and who can approve it. 

At each stage before approval, the supplier would be able to upload documentation to IPFS, which the signatory would view and approve. The approval transaction would be payment (if applicable) and setting of who is dealing with the next stage for supplying and approving. They would be restricted by the owner's configuration.

At the final stage, the last approval will unlock the NFT for transfer, as the ERC721 is written in such a way that ownership transfer per token is blocked until the product supply chain/workflow has completed. 

The contract is written in such a way that there is always a fixed mint limit providing a level of scarcity for collectors or for a business to batch their production by supply dynamics.

This repo has been forked from https://github.com/austintgriffith/scaffold-eth and modified for our needs.
