const { default: Web3 } = require("web3");

const NFT = artifacts.require("NFT");

contract("NFT", (accounts) => {
  const initialMsg = "hello";
  const creatorAccount = accounts[1];
  let instance;

  beforeEach(async () => {
    instance = await NFT.new(initialMsg, { from: accounts[1] });
  });

  it("should initialize values", async () => {
    const text = await instance.text.call();

    assert.equal(text, initialMsg);

    console.log("accounts:", accounts);

    const creator = await instance.creator.call();
    assert.equal(creator, creatorAccount);

    const owner = await instance.owner.call();
    assert.equal(owner, creatorAccount);

    const lastSaleAmount = (await instance.lastSaleAmount.call()).toString();
    assert.equal(lastSaleAmount, "0");
  });

  describe("buy", () => {
    it("should change owner", async () => {
      const buyer = accounts[3];

      await instance.buy({ from: buyer, value: 10 });
      const owner = await instance.owner.call();
      assert.equal(owner, buyer);
    });

    it("should fail if caller pays less or the same amount as previous owner", async () => {
      const firstBuyer = accounts[3];
      const failedBuyer = accounts[2];

      await instance.buy({ from: firstBuyer, value: 10 });
      try {
        await instance.buy({ from: failedBuyer, value: 10 });
      } catch (error) {
        assert.equal(
          error.reason,
          "the amount of money must be greater than the previos sale"
        );
      }

      const owner = await instance.owner.call();
      assert.equal(owner, firstBuyer);
    });
  });

  describe("setText", () => {
    it("fail for non-owner", async () => {
      const buyer = accounts[3];

      await instance.buy({ from: buyer, value: 10 });

      try {
        await instance.setText("hello there", { from: accounts[5] });
        expect.fail();
      } catch (error) {
        assert.equal(error.reason, "you are not the owner");
      }
    });

    it("owner must be able to set text", async () => {
      const text = await instance.text.call();
      assert.equal(text, initialMsg);

      const buyer = accounts[3];

      await instance.buy({ from: buyer, value: 10 });
      await instance.setText("hello there", { from: buyer });

      const newMsg = "hello there";
      const textAfterUpdate = await instance.text.call();
      assert.equal(textAfterUpdate, newMsg);
    });
  });

  describe("claim", () => {
    it("should fail for non-creator", async () => {
      try {
        await instance.claim({ from: accounts[4] });
      } catch (error) {
        console.log(error.reason);
        assert.equal(error.reason, "only creator can claim funds");
      }
    });

    it("should pay funds to the creator", async () => {
      const initialBalance = await web3.eth.getBalance(creatorAccount);

      await instance.buy({
        from: accounts[0],
        value: web3.utils.toWei("1", "ether"),
      });
      await instance.claim({ from: creatorAccount });

      const finaleBalance = await web3.eth.getBalance(creatorAccount);
      assert.isAbove(Number(finaleBalance), Number(initialBalance));
    });

    it("should not be able to interact after", async () => {
      await instance.finalize({ from: creatorAccount });

      await instance.buy({ from: accounts[0], value: 100 });
    });
  });
});
