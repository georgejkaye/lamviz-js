{-|
Module: Generator
Description: Generates and enumerates lambda terms

This module contains Haskell implementations for methods to
generate and enumerate various fragments of the lambda
calculus
-}
module Generator where

import Data.List ((\\))

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
  Enumerate all the planar lambda terms with subterms n and free variables k.
-}
enumeratePlanarTerms :: Int -> Int -> Int
enumeratePlanarTerms 0 _ = 0
enumeratePlanarTerms 1 0 = 0
enumeratePlanarTerms 1 _ = 1
enumeratePlanarTerms n k = enumeratePlanarTerms (n-1) (k+1)
                         + sum [(enumeratePlanarTerms n1 k1) * (enumeratePlanarTerms (n-1-n1) (k-k1)) | n1 <- [1..n-2], k1 <- [0..k]]

{-|
  Enumerate all the linear lambda terms with subterms n and free variables k.
-}
enumerateLinearTerms :: Int -> Int -> Int
enumerateLinearTerms 0 _ = 0
enumerateLinearTerms 1 0 = 0
enumerateLinearTerms 1 _ = 1
enumerateLinearTerms n k = enumerateLinearTerms (n-1) (k+1)
                         + sum [(choose k k1) * (enumerateLinearTerms n1 k1) * (enumerateLinearTerms (n-1-n1) (k-k1)) | n1 <- [1..n-2], k1 <- [0..k]]


{-|
  Generate all of the general lambda terms with subterms n and free variables k.
-}
generateTerms :: Int -> Int -> [Term]
generateTerms 0 _ = []
generateTerms 1 k = [Var x | x <- [0..k-1]]
generateTerms n k = [Abs t | t <- generateTerms (n-1) (k+1)]
                      ++ [App t1 t2 | n1 <- [1..n-2], t1 <- generateTerms n1 k, t2 <- generateTerms (n-1-n1) k]                 

{-|
  Generate all of the planar lambda terms with subterms n and free variables k.
-}
generatePlanarTerms :: Int -> Int -> [Term]
generatePlanarTerms n k = generatePlanarTerms' n (descList (k-1) 0)

generatePlanarTerms' :: Int -> [Int] -> [Term]
generatePlanarTerms' 0 _ = []
generatePlanarTerms' 1 [k] = [Var k]
generatePlanarTerms' 1 _ = []
generatePlanarTerms' n ks = [Abs t | t <- generatePlanarTerms' (n-1) ((map (+1) ks) ++ [0])]
                      ++ [App t1 t2 | n1 <- [1..n-2], i <- [0..(length ks)], t1 <- generatePlanarTerms' n1 (fst (splitAt i ks)), t2 <- generatePlanarTerms' (n-1-n1) (snd (splitAt i ks))]      

{-|
  Generate all of the linear lambda terms with subterms n and free variables k.
-}
generateLinearTerms :: Int -> Int -> [Term]
generateLinearTerms n k = generateLinearTerms' n (descList (k-1) 0)

generateLinearTerms' :: Int -> [Int] -> [Term]
generateLinearTerms' 0 _ = []
generateLinearTerms' 1 [k] = [Var k]
generateLinearTerms' 1 _ = []
generateLinearTerms' n ks = [Abs t | t <- generateLinearTerms' (n-1) ((map (+1) ks) ++ [0])]
                      ++ [App t1 t2 | n1 <- [1..n-2], ks' <- chooseLists ks, t1 <- generateLinearTerms' n1 (ks'), t2 <- generateLinearTerms' (n-1-n1) (ks \\ ks')]      


chooseLists :: [Int] -> [[Int]]
chooseLists xs = [] : chooseLists' xs []

chooseLists' :: [Int] -> [[Int]] -> [[Int]]
chooseLists' [] acc = acc
chooseLists' (x : xs) acc = chooseLists' xs (acc ++ ([x] : map (\ys -> x : ys) (chooseLists' xs [])))

{-
  Pretty print a lambda term
-}                    
prettyPrint :: Term -> String
prettyPrint t = prettyPrint' t 0

prettyPrint' :: Term -> Int -> String
prettyPrint' (Var x) _ = show x
prettyPrint' (Abs t) 0 = "$ " ++ (prettyPrint' t 0)
prettyPrint' (Abs t) x = "($ " ++ (prettyPrint' t (x+1)) ++ ")"     
prettyPrint' (App t1 t2) 0 = (prettyPrint' t1 1) ++ " " ++ (prettyPrint' t2 1)
prettyPrint' (App t1 t2) x = "(" ++ (prettyPrint' t1 0) ++ " " ++ (prettyPrint' t2 x) ++ ")"             

{-
  Generate a descending list of integers from and including a given x down to and including a given y
-}
descList :: Int -> Int -> [Int]
descList x y = descList' x y []

descList' :: Int -> Int -> [Int] -> [Int]
descList' x y xs = if x <= y then xs else descList' (x-1) y (xs ++ [x])

{-
  Compute the binomial coefficient for a given n and r
  Adapted from https://stackoverflow.com/a/6806997
-}
choose :: Int -> Int -> Int
choose _ 0 = 1
choose 0 _ = 0
choose n r = choose (n-1) (r-1) * n `div` r