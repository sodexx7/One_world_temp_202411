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
});
