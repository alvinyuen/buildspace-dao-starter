import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x81dce543F5528d8365Ee22bCd46c1655E34FC90D",
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Stakers Membership",
        description: "This NFT will give you access to Stakers Alpha",
        image: readFileSync("scripts/assets/stakers.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()