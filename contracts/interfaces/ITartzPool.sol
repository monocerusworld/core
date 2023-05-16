// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import './pool/ITartzPoolImmutables.sol';
import './pool/ITartzPoolState.sol';
import './pool/ITartzPoolDerivedState.sol';
import './pool/ITartzPoolActions.sol';
import './pool/ITartzPoolOwnerActions.sol';
import './pool/ITartzPoolEvents.sol';

/// @title The interface for a Tartz Pool
/// @notice A Tartz pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface ITartzPool is
    ITartzPoolImmutables,
    ITartzPoolState,
    ITartzPoolDerivedState,
    ITartzPoolActions,
    ITartzPoolOwnerActions,
    ITartzPoolEvents
{

}
