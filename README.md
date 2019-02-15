# fyp
The repo for my masters project, a set of tools to help investigation of terms from various fragments of the λ-calculus. The core function of the tools is to represent these λ-terms as *maps* - some background on maps and how λ-terms can be represented as them can be found in my [**Scientific Paper**](/docs/2018-11-23-scientific-paper.pdf).

## Tools
There are currently two tools available:
   * **λ-term visualiser**
   * **λ-term gallery** 

### λ-term visualiser
![λ-term visualiser](/pics/visualiser.png)

This is a tool to visualise λ-terms as maps. A user can input a term and a set of free variables, and the tool will draw the corresponding map.

### λ-term gallery
![λ-term gallery](/pics/gallery.png)

This tool builds on the visualiser to generate galleries of λ-terms that fulfill certain critera. The primary parameters for generating terms are the size and the number of free variables. Terms can be generated from the pure, linear or planar λ-calculus. The generated terms can also be filtered by a number of different properties, such as crossings in the generated maps.

![λ-term portrait](/pics/term.png)

The generated terms can be inspected in greater detail by clicking on them. This provides all sorts of interesting information about the term, such as the available beta-redexes. By clicking on the redexes, the term can be normalised to its normal form. In the future users will be able to generate a normalisation graph of this term.

## Documentation

The [**Project Proposal**](/docs/2018-10-26-project-proposal.pdf) is a brief overview of the aim of this project and a possible schedule.

The [**Scientific Paper**](/docs/2018-11-23-scientific-paper.pdf) gives some background on the topics involved, and how the project was progressing towards the end of November.