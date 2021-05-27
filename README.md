# eth-global-NFT-ME

The premise of this project is to provide quality assurance and payment of an item through a staged supply chain of a minted NFT.

This minted Token in the NFT Contract (ERC721) will become "sellable" once all stages are complete. This provides full supply chain and provenance visibility.

Some future considerations will be to look into hiding supplier costs so the owner can have competing margins between suppliers.

Stages are a blueprint for each Token that is minted - e.g. I sell a new car, I will do stages x,y,z ending in delivery + transfer of ownership

Later enhancement can include things like deposits paid by the end customers and assigning initial owner

Some thoughts:
1. Stages are assignable from the available addresses (e.g. I have 3 suppliers I could choose from, but I assign to the second one)
2. Until the stage is signed by the account on the next stage the current worker can assign multiple times - this means a manager can insist on rework
3. Fees per stage may be zero, if we are doing manufacture and a floor worker is just assigned the role of completing the job ( if they are contract workers they could be paid too if a fee is added )
4. Minting a token does not assign stage one, it just puts the creation into play, and the owner will decide from the addresses allocated for 
5. Owner cannot withdraw all funds, only those that have not been allocated
6. Contract needs to be pausable
7. Contract needs to be ownable
8. Jobs cannot move from one stage to the next until there are addresses to perform the next stage
9. NFT Token instance cannot be transfered/sold until stages are complete
10. Metadata for contract will be stord on IPFS
11. Once an Address has signed or been allocated to a stage and that stage has completed the address cannot be removed from the collection
12. previous stages cannot be put in earlier if earlier ones are already signed/completed.


Development Phases as I see them: ( each step is contract + UI )
1. eth-scaffold and build the NFT contract creation and minting with main image stored on IPFS
2. tests / deploy mechanics
3. start the basic stages - add/remove - insert at position etc. - only owner before any work has started
4. add addresses to stages with their fees - this allows workers or suppliers different rates of pay
5. tests
6. add documents to stage (only currently assigned)  can't change once stage is complete
7. tests
8. remove document from stage (only currently assigned) - can't change once stage is complete
9. tests
10. assign stage step ( owner can add first step only )
11. tests
12. assign stage step ( current person can assign next from list of suppliers)
13. tests
14. accept stage ( next assignd address accepts responsibility for the stage )
15. transfer ( only onces all stages are complete )
16. set max mintable (e.g. limited edition cars)

Simple example:
Build a car: 
1. manufacturing plant adds car type (new contract)
2. adds stage of build engine
3. adds stage of build chassis 
4. adds stage of build upholstery
5. adds stage of fitting and wheels, rest of transmission to frame
6. adds stage of painting
7. adds stage of cleaning
8. adds stage of quality control testing
9. adds stage of registering
10. sell car
