import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();


describe("Adashe Contract", function () {
    let adashe: any;
    const noOfPeople = 5;
    const amountPerHead = 100;
    const duration = 30;

    beforeEach(async function () {
        adashe = await ethers.deployContract("Adashe", [noOfPeople, amountPerHead, duration]);
    });

describe("Deployment Successful", function () {
    it("Should set the number of people", async function () {
        const blockchainNoOfPeople = await adashe.noOfPeople();
        expect(blockchainNoOfPeople).to.equal(noOfPeople);
    });
    it("Should set the amount per head", async function () {
        const blockchainAmountPerHead = await adashe.amountPerHead();
        expect(blockchainAmountPerHead).to.equal(amountPerHead);
    });
    it("Should set the duration", async function () {
        const blockchainDuration = await adashe.duration();
        expect(blockchainDuration).to.equal(duration);
    });
    it("Should set the status to PENDING", async function () {
        const blockchainStatus = await adashe.status();
        expect(blockchainStatus).to.equal(adashe.Packed.PENDING);
    });
});
    
});
