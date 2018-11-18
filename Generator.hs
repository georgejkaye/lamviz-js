{-|
Module: Generator
Description: Generates and enumerates lambda terms

This module contains Haskell implementations for methods to
generate and enumerate various fragments of the lambda
calculus
-}
module Generator where

data Term = Var Int | Abs Term | App Term Term deriving (Show)

{-|
  Enumerate all the general lambda terms with subterms n and free variables k.
-}
enumerateTerms :: Int -> Int -> Int
enumerateTerms 0 _ = 0
enumerateTerms 1 k = k
enumerateTerms n k = enumerateTerms (n-1) (k+1)
                         + sum [(enumerateTerms n1 k) * (enumerateTerms (n-1-n1) k) | n1 <- [1..n-2]]

{-|
  Generate all of the general lambda terms with subterms n and free variables k.
-}
generateTerms :: Int -> Int -> [Term]
generateTerms 0 _ = []
generateTerms 1 k = [Var x | x <- [0..k-1]]
generateTerms n k = [Abs t | t <- generateTerms (n-1) (k+1)]
                      ++ [App t1 t2 | n1 <- [1..n-2], t1 <- generateTerms n1 k, t2 <- generateTerms (n-1-n1) k]                 

prettyPrint :: Term -> String
prettyPrint t = prettyPrint' t 0

prettyPrint' :: Term -> Int -> String
prettyPrint' (Var x) _ = show x
prettyPrint' (Abs t) 0 = "\\" ++ (prettyPrint' t 0)
prettyPrint' (Abs t) x = "(\\" ++ (prettyPrint' t (x+1)) ++ ")"     
prettyPrint' (App t1 t2) 0 = (prettyPrint' t1 0) ++ " " ++ (prettyPrint' t2 1)
prettyPrint' (App t1 t2) x = "(" ++ (prettyPrint' t1 0) ++ " " ++ (prettyPrint' t2 x) ++ ")"             