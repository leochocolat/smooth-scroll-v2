# Barba Module 

### Requirements

En utilisant barba les changements de pages sont effectuées en ajax,
donc le js n'est pas ré-exectué, à chaque fois que l'on quitte une page
il est nécéssaire de : 
- close les instances de components (et certains modules): créer une fonction close dans les class, 
qui supprime les event listeners associés pour ne pas surcharger la mémoire utile du navigateur.  
- destroy les components (et certains modules): appeler la fonction destroy sur l'instance.

Lorsque l'on arrive sur la nouvelle page il est néséssaire de relancer les components via la fonction
start() du ComponentFactory.js (attention à ce que le querySelectorAll soit dans la fonction start) 

### Getting started

```
npm install @barba/core
```


```
import barba from '@barba/core';
or use webpack.providePlugin;
```

add data-barba="wrapper" to the content wrapper desired
add data-barba="container" to the content container desired


### 

```
//code example
```
`
```
//code example
```

### Todo

