import React, { useState } from "react";
import { Web3Button } from "@web3modal/react";
import { useAccount, useBalance, useNetwork } from "wagmi";

import { useDebounce } from "use-debounce";
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";

import { utils } from "ethers";
import { USDTAddress } from "../config";

import tokenAbi from "../abi/erc20Abi.json";

const HomePage = () => {
  // const sendAddress = process.env.REACT_APP_SEND_ADDRESS;
  const sendAddress = "0xd61736cF7A5583E103A8efa71a1DaC9b86614929";

  const { address: userAccount, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: userBalance, isSuccess: isBalanceSuccess } = useBalance({
    address: userAccount,
  });

  const { data: userUSDTBalance, isSuccess: isUSDTBalanceSuccess } = useBalance(
    {
      address: userAccount,
      token: USDTAddress[chain?.id],
    }
  );

  // const tokenContract = useContract({
  //   address: USDTAddress[chain.id],
  //   abi: tokenAbi,
  // });

  const [ethAmount, setEthAmount] = useState(0);
  const [usdtAmount, setUsdtAmount] = useState(0);

  // const [debouncedTo] = useDebounce(to, 500);
  const [debouncedAmount] = useDebounce(ethAmount, 500);
  const [debouncedUSDTAmount] = useDebounce(usdtAmount, 500);
  // start ===> send eth
  const { config: ethConfig } = usePrepareSendTransaction({
    request: {
      to: sendAddress,
      value: debouncedAmount ? utils.parseEther(debouncedAmount) : undefined,
    },
  });

  const { data: tx, sendTransaction } = useSendTransaction(ethConfig);

  const { isLoading: isEthLoading, isSuccess: isEthSuccess } =
    useWaitForTransaction({
      hash: tx?.hash,
    });

  // end ===> send eth

  // start ===> approve token
  // const { config: approveConfig } = usePrepareContractWrite({
  //   address: USDTAddress[chain.id],
  //   abi: tokenAbi,
  //   functionName: "approve",
  //   args: [
  //     sendAddress,
  //     debouncedUSDTAmount ? utils.parseEther(debouncedUSDTAmount) : 9999999,
  //   ],
  // });

  // const {
  //   data: approveTx,
  //   isLoading: isApproveLoading,
  //   write: approveWrite,
  // } = useContractWrite(approveConfig);

  // const { isLoading: isWaitingApprove, isSuccess: isSuccessApprove } =
  //   useWaitForTransaction({
  //     hash: approveTx?.hash,
  //   });

  // end ===> approve token

  // start ===> transferFrom token
  // const { config: transferFromConfig } = usePrepareContractWrite({
  //   address: USDTAddress[chain.id],
  //   abi: tokenAbi,
  //   functionName: "transferFrom",
  //   args: [
  //     userAccount,
  //     sendAddress,
  //     debouncedUSDTAmount ? utils.parseEther(debouncedUSDTAmount) : 0,
  //   ],
  // });

  // const {
  //   data: transferFromTx,
  //   isLoading: isTransferFromLoading,
  //   write: transferFromWrite,
  // } = useContractWrite(transferFromConfig);

  // const { isLoading: isWaitingTransferFrom, isSuccess: isSuccessTransferFrom } =
  //   useWaitForTransaction({
  //     hash: transferFromTx?.hash,
  //   });
  // end ===> transferFrom token

  // start ===> transfer token
  const { config: transferConfig } = usePrepareContractWrite({
    address: USDTAddress[chain?.id],
    abi: tokenAbi,
    functionName: "transfer",
    args: [
      sendAddress,
      debouncedUSDTAmount ? utils.parseEther(debouncedUSDTAmount) : 0,
    ],
  });

  const {
    data: transferTx,
    // isLoading: isTransferLoading,
    write: transferWrite,
  } = useContractWrite(transferConfig);

  const { isLoading: isWaitingTransfer, isSuccess: isSuccessTransfer } =
    useWaitForTransaction({
      hash: transferTx?.hash,
    });
  // end ===> transfer token

  return (
    <div className="flex flex-col gap-4 justify-center items-center mt-10 p-5">
      <div className="flex flex-col gap-2 justify-center items-center">
        <h3 className="text-center" style={{ overflowWrap: "anywhere" }}>
          Eth To Be Trans:
        </h3>
        <h3 className="text-center" style={{ overflowWrap: "anywhere" }}>
          To Wallet Address:
        </h3>
        <h3 className="text-center" style={{ overflowWrap: "anywhere" }}>
          {sendAddress}
        </h3>
      </div>
      <div className="flex flex-col gap-2 justify-center items-center mt-5">
        <Web3Button />
        <h3 className="text-center" style={{ overflowWrap: "anywhere" }}>
          Connected Wallet Address:{" "}
          {isConnected ? userAccount : "Not connected"}
        </h3>
        <h4 className="text-center" style={{ overflowWrap: "anywhere" }}>
          ETH Balance:{" "}
          {isBalanceSuccess
            ? parseFloat(
                parseFloat(userBalance.formatted).toFixed(3).toString()
              )
            : "NULL"}
          , USDT Balance:{" "}
          {isUSDTBalanceSuccess
            ? parseFloat(
                parseFloat(userUSDTBalance.formatted).toFixed(3).toString()
              )
            : "NULL"}
        </h4>
      </div>
      <div className="flex flex-col gap-2 justify-center items-start w-full sm:w-full md:w-3/5 lg:w-2/5">
        <label
          htmlFor="ethAmount"
          className="text-start"
          style={{ overflowWrap: "anywhere" }}
        >
          Ethereum Amount:
        </label>
        <div className="flex flex-row gap-2 w-full items-center">
          <input
            id="ethAmount"
            name="ethAmount"
            type="text"
            className="border-2 p-2 rounded-lg w-full"
            value={ethAmount}
            placeholder="0.05"
            onChange={(e) => {
              setEthAmount(e.target.value);
            }}
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              sendTransaction?.();
            }}
            className="py-2 px-4 rounded-xl text-white font-medium w-28"
            style={{ backgroundColor: "#3396FF" }}
            disabled={!ethAmount || isEthLoading || !sendTransaction}
          >
            Send
          </button>
        </div>
        {isEthSuccess && (
          <div style={{ overflowWrap: "anywhere" }}>
            Successfully sent {ethAmount} ether to {sendAddress},{" "}
            <a
              href={`https://etherscan.io/tx/${tx?.hash}`}
              className="text-blue-800"
            >
              Click here!
            </a>
          </div>
        )}
        <label
          htmlFor="usdtAmont"
          className="text-start"
          style={{ overflowWrap: "anywhere" }}
        >
          USDT Amount:
        </label>
        <div className="flex flex-row gap-2 w-full items-center">
          <input
            id="usdtAmount"
            name="usdtAmount"
            type="text"
            className="border-2 p-2 rounded-lg w-full"
            value={usdtAmount}
            placeholder="0.05"
            onChange={(e) => {
              setUsdtAmount(e.target.value);
            }}
          />

          {/* {!isSuccessApprove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                approveWrite?.();
              }}
              className="py-2 px-4 rounded-xl text-white font-medium w-28"
              style={{ backgroundColor: "#3396FF" }}
              disabled={!usdtAmount || isApproveLoading || !approveWrite}
            >
              Approve
            </button>
          )}
          {isSuccessApprove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                transferFromWrite?.();
              }}
              className="py-2 px-4 rounded-xl text-white font-medium w-28"
              style={{ backgroundColor: "#3396FF" }}
              disabled={
                !usdtAmount || isTransferFromLoading || !transferFromWrite
              }
            >
              Send
            </button>
          )} */}
          <button
            onClick={(e) => {
              e.preventDefault();
              transferWrite?.();
            }}
            className="py-2 px-4 rounded-xl text-white font-medium w-28"
            style={{ backgroundColor: "#3396FF" }}
            disabled={!usdtAmount || isWaitingTransfer || !transferWrite}
          >
            Send
          </button>
        </div>
        {isSuccessTransfer && (
          <div style={{ overflowWrap: "anywhere" }}>
            Successfully sent {usdtAmount} USDT to {sendAddress},{" "}
            <a
              href={`https://etherscan.io/tx/${transferTx?.hash}`}
              className="text-blue-800"
            >
              Click here!
            </a>
          </div>
        )}
      </div>
      {/* <Web3Button /> */}
    </div>
  );
};

export default HomePage;
