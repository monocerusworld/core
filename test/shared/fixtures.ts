import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimeTartzPool } from '../../typechain/MockTimeTartzPool'
import { TestERC20 } from '../../typechain/TestERC20'
import { TartzFactory } from '../../typechain/TartzFactory'
import { TestTartzCallee } from '../../typechain/TestTartzCallee'
import { TestTartzRouter } from '../../typechain/TestTartzRouter'
import { MockTimeTartzPoolDeployer } from '../../typechain/MockTimeTartzPoolDeployer'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: TartzFactory
}

async function factoryFixture(): Promise<FactoryFixture> {
  const factoryFactory = await ethers.getContractFactory('TartzFactory')
  const factory = (await factoryFactory.deploy()) as TartzFactory
  return { factory }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestTartzCallee
  swapTargetRouter: TestTartzRouter
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimeTartzPool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimeTartzPoolDeployerFactory = await ethers.getContractFactory('MockTimeTartzPoolDeployer')
  const MockTimeTartzPoolFactory = await ethers.getContractFactory('MockTimeTartzPool')

  const calleeContractFactory = await ethers.getContractFactory('TestTartzCallee')
  const routerContractFactory = await ethers.getContractFactory('TestTartzRouter')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestTartzCallee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestTartzRouter

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer = (await MockTimeTartzPoolDeployerFactory.deploy()) as MockTimeTartzPoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string
      return MockTimeTartzPoolFactory.attach(poolAddress) as MockTimeTartzPool
    },
  }
}
