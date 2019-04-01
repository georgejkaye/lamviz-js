# A visualiser for λ-terms as rooted maps

My MSci final year project: a set of tools to help investigation of terms from various fragments of the λ-calculus. The core function of the tools is to represent these λ-terms as *maps* - some background on maps and how λ-terms can be represented as them can be found in my [**Scientific Paper**](/docs/2018-11-23-scientific-paper.pdf).

## Tools
Two tools were made for the project:
* [**λ-term visualiser**](/visualiser.html)
* [**λ-term gallery**](/gallery.html)

### λ-term visualiser
![λ-term visualiser](/pics/visualiser.png)

This is a tool to visualise λ-terms as maps. A user can input a term and a set of free variables, and the tool will draw the corresponding map.

### λ-term gallery
![λ-term gallery](/pics/gallery.png)

This tool builds on the visualiser to generate galleries of λ-terms that fulfill certain critera. The primary parameters for generating terms are the size and the number of free variables. Terms can be generated from the pure, linear or planar λ-calculus. The generated terms can also be filtered by a number of different properties, such as crossings in the generated maps.

### λ-term portraits
![Redex 1](/pics/redex1.png)
![Redex 2](/pics/redex2.png)

All sorts of interesting information is provided about terms, such as the available beta-redexes. By hovering over these redexes, they will be highlighted in the term and on the visualised map. Reductions can be performed by clicking on the redexes, or alternatively the process can be animated in innermost or outermost strategies.

### Normalisation graphs
![Normalisation graph](/pics/normalisation-graph.png)
![Omega normalisation graph](/pics/omega.png)
Normalisation graphs can also be generated for terms!

## Documentation

The [**Project Proposal**](/docs/2018-10-26-project-proposal.pdf) is a brief overview of the aim of this project and a possible schedule.

The [**Scientific Paper**](/docs/2018-11-23-scientific-paper.pdf) gives some background on the topics involved, and how the project was progressing towards the end of November.

The [**Project Report**] (coming soon!) is the actual dissertation.
