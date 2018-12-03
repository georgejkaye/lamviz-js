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
  Enumerate all the plaanr lambda terms with subterms n and free variables k.
-}
enumeratePlanarTerms :: Int -> Int -> Int
enumeratePlanarTerms 0 _ = 0
enumeratePlanarTerms 1 0 = 0
enumeratePlanarTerms 1 _ = 1
enumeratePlanarTerms n k = enumeratePlanarTerms (n-1) (k+1)
                         + sum [(enumeratePlanarTerms n1 k1) * (enumeratePlanarTerms (n-1-n1) (k-k1)) | n1 <- [1..n-2], k1 <- [0..k]]

{-|
  Generate all of the general lambda terms with subterms n and free variables k.
-}
generateTerms :: Int -> Int -> [Term]
generateTerms 0 _ = []
generateTerms 1 k = [Var x | x <- [0..k-1]]
generateTerms n k = [Abs t | t <- generateTerms (n-1) (k+1)]
                      ++ [App t1 t2 | n1 <- [1..n-2], t1 <- generateTerms n1 k, t2 <- generateTerms (n-1-n1) k]                 

generatePlanarTerms :: Int -> Int -> [Term]
generatePlanarTerms n k = generatePlanarTerms' n (descList (k-1) 0)

generatePlanarTerms' :: Int -> [Int] -> [Term]
generatePlanarTerms' 0 _ = []
generatePlanarTerms' 1 [k] = [Var k]
generatePlanarTerms' 1 _ = []
generatePlanarTerms' n ks = [Abs t | t <- generatePlanarTerms' (n-1) ((map (+1) ks) ++ [0])]
                      ++ [App t1 t2 | n1 <- [1..n-2], i <- [0..(length ks)], t1 <- generatePlanarTerms' n1 (fst (splitAt i ks)), t2 <- generatePlanarTerms' (n-1-n1) (snd (splitAt i ks))]      

prettyPrint :: Term -> String
prettyPrint t = prettyPrint' t 0

prettyPrint' :: Term -> Int -> String
prettyPrint' (Var x) _ = show x
prettyPrint' (Abs t) 0 = "/." ++ (prettyPrint' t 0)
prettyPrint' (Abs t) x = "(/." ++ (prettyPrint' t (x+1)) ++ ")"     
prettyPrint' (App t1 t2) 0 = (prettyPrint' t1 0) ++ " " ++ (prettyPrint' t2 1)
prettyPrint' (App t1 t2) x = "(" ++ (prettyPrint' t1 0) ++ " " ++ (prettyPrint' t2 x) ++ ")"             

descList :: Int -> Int -> [Int]
descList x y = descList' x y []

descList' :: Int -> Int -> [Int] -> [Int]
descList' x y xs = if x <= y then xs else descList' (x-1) y (xs ++ [x])