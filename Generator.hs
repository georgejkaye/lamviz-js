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
enumeratePlanarTerms 1 1 = 1
enumeratePlanarTerms 1 _ = 0
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

                      
chooseLists :: [a] -> [[a]]
chooseLists xs = foldr (++) [] [chooseElems xs k | k <- [0..(length xs)]]

chooseElems :: [a] -> Int -> [[a]]
chooseElems xs k = chooseElems' xs k []

chooseElems' :: [a] -> Int -> [[a]] -> [[a]]
chooseElems' _ 0 _ = [[]]
chooseElems' (x : xs) k acc
          | length (x : xs) == k = acc ++ [(x : xs)]
          | otherwise             = chooseElems' xs k (acc ++ (map (\ys -> x : ys) (chooseElems xs (k-1))))

{-
  Pretty print a lambda term
-}                    
prettyPrint :: Term -> IO()
prettyPrint t = do 
                  prettyPrint' t 0
                  putStr "\n"

prettyPrint' :: Term -> Int -> IO()
prettyPrint' (Var x) _ = putStr (show x)
prettyPrint' (Abs t) 0 =      do 
                                putStr "\\ "
                                prettyPrint' t 0
prettyPrint' (Abs t) x =      do
                                putStr "(\\ "
                                prettyPrint' t (x+1)
                                putStr ")"
prettyPrint' (App t1 t2) 0 =  do
                                prettyPrint' t1 1
                                putStr " "
                                prettyPrint' t2 1
prettyPrint' (App t1 t2) x =  do
                                putStr "("
                                prettyPrint' t1 1
                                putStr " "
                                prettyPrint' t2 x
                                putStr ")"

printTermList :: [Term] -> IO()
printTermList [] = return ()
printTermList (x : xs) = do
                            prettyPrint x
                            printTermList xs

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
