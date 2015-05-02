# PatternMatch

This was a school assignment in CS137a at UCLA.

Our goal was to implement an internal domain specific language in JavaScript. 
This DSL allows us to pattern match over objects. At the bare bones,
it is essentially a switch statement wrapped in a function. However, when 
introducing variables, we can create bindings.

The match function:

```javascript
match(value, pat1, fun1, pat2, fun2, ...)
```

A simple matching example using just literals and wildcards inside arrays:

```javascript
match(["+", 5, 7],
      ["+", _, 8], function(x, y) { return x + y; }, //#1
      ["+", 6, 7], function(x, y) { return x + y; }, //#2
      ["+", 5, _], function(x)    { return x; })     //#3
```

As can be seen here, we can match on the wildcard pattern (the underscore), 
which will match any value. Pattern #3 will create a match, and 
the underscore will create a binding for the subsequent function call, thus
returning the variable x, which is bound to 7. A literal matching to another literal
doesn't yield a binding.

We can also match over any amount of values in an array. 

```javascript
match([1,2,3], [many(_)], function(l) {return l;})
```

This many pattern will collect zero or more values in the array that match to
the wildcard pattern. So in this case, it will collect all the values and
return the same array. If we want to be more specific, we can add in
predicates:

```javascript
match([1,2,3,"notNumber"], [many(when(isNumber))], function(l) {return l;})
```
This will only collect the first 3 numbers of the array and return them
as an array. Since the string is not a number, the matching will stop there.

This example shows two different bindings being created:

```javascript
match([1,2,3], [many(when(isOne)),many(_)], function() { return JSON.stringify(arguments); })
```
The result:
```javascript
"{\"0\":[1],\"1\":[2,3]}"
```

Lastly, just a little fancy one with nested patterns..

```javascript
match([[1, 2], [3, 4], [5, 6]],
      [many([_, _])], function(pts) { return JSON.stringify(pts); })
```

This actually will flatten the array, yielding the result:

```javascript
"[1,2,3,4,5,6]"
```
