
function match(value) { 	
  var args = Array.prototype.slice.call(arguments);
  args = args.slice(1);
  var pm = new Pattern(value, args);
  return pm.patternMatch();
}

function When(f) { this.func = f; }
function Many(p) { this.pattern = p; }
var _ = "wildcard";
var many = function(p) { return new Many(p); }
var when = function(f) { return new When(f); }

function Pattern(value, args) {
  //this.stack[0] essentially holds the argument array that will be passed into the matched function
  this.value = value; this.patterns = []; this.functions = []; this.stack = [[]]; this.index = -1;
  //split the args into their respective pattern and function arrays
  for (var i = 0; i < args.length; i++) {
    if (i === 0 || i % 2 === 0)
      this.patterns.push(args[i]);
    else
      this.functions.push(args[i]);
  }
}

Pattern.prototype.evalFunc = 
function() {
  var f = this.functions[this.index];
  return f.apply(undefined, this.stack[0]);
}

//main pattern matching function
Pattern.prototype.patternMatch = 
function() {
  for (var i = 0; i < this.patterns.length; i++) {
	 if (this.checkPattern(this.value, this.patterns[i], true)) {
			this.index = i;
			return this.evalFunc();
		} 
		else  //function arg array might contain some bad values if we didn't find match
			while (this.stack[0].length > 0) //clear those values
				this.stack[0].pop();
	}
	throw new Error("Match failed.");
}

//recursive function when dealing with nested array patterns
Pattern.prototype.checkPattern = 
function(val, pat, addValToFuncArgs) {	
	if (pat === _) {	//wildcard pattern
		if (addValToFuncArgs)
			this.stack[0].push(val);
		else
			this.stack[this.stack.length - 1].push(val);
		return true;
	}
	else if (pat instanceof When) { //conditional When
		if (pat.func(val)) {
			if (addValToFuncArgs)
				this.stack[0].push(val);
			else 
				this.stack[this.stack.length - 1].push(val);
			return true;
		}
		return false;
	}
	else if (val instanceof Array) { //if we are matching an array with a pattern (may or mayn't be array)
		if (pat instanceof Array && pat[0] instanceof Many) {
			var manyObj = pat[0];
			pat = pat.slice(1);
			
			this.stack.push([]); //push array that will hold the matched 'many' values
			
			//main loop to reduce the value array until it can't match anymore
			while (val.length > 0 && this.checkPattern(val[0], manyObj.pattern, false)) 
				val = val.slice(1);

			var last = this.stack.pop();	
			this.stack[this.stack.length - 1].push(last); //push the popped array onto the next most recent array
				
			if (val.length === pat.length) {
				if (val.length === 0) 		//both arrays are finished
					return true;
				else if (val.length > 0)  
					return this.checkPattern(val, pat, true);
			}
				
			if (val.length > 0 && pat.length > 0) 
				return this.checkPattern(val, pat, true);
			else 
				return false;
		}
		else if (pat instanceof Array && pat.length > 0 && val.length > 0) 
			return this.checkPattern(val[0], pat[0], addValToFuncArgs) && 
				   this.checkPattern(val.slice(1), pat.slice(1), addValToFuncArgs);
		else if (val.length !== pat.length)
			return false;
		else
			return true;
	}
	else //primitive values
		return val === pat;
}
