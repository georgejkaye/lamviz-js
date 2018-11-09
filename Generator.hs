{-|
Module: Generator
Description: Generates and enumerates lambda terms

This module contains Haskell implementations for methods to
generate and enumerate various fragments of the lambda
calculus
-}
module Generator where

data Term = Var Int | Abs Term | App Term Term

{-|
  Enumerate all the general lambda terms with subterms n and free variables k.
-}
enumerateTerms :: Int -> Int -> Int
enumerateTerms 0 _ = 0
enumerateTerms n k = enumerateTerms (n-1) (k+1)   -- abstraction case has one less subterm (the whole term) but one more free variable (the abstracted variable) 
                        + sum [(enumerateTerms n1 k) * (enumerateTerms (n-1-n1) k) | n1 <- [1..n-2]]
                        + sum [1 | n == 1] 