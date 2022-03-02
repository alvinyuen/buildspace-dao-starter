import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x81dce543F5528d8365Ee22bCd46c1655E34FC90D",
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    // Specify conditions.
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 1000,
      maxQuantityPerTransaction: 1,
    });
    
    // interact with our deployed contract on-chain and adjust the conditions
    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log("✅ Successfully set claim condition on bundle drop:", bundleDrop.address);
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})()