//Writen by Professor Corey Clark
var CMap = function(linkEntries){
    this.current = undefined;
    this.size = 0;
    this.isLinked = true;

    if(linkEntries === false)
    {
        this.disableLinking();
    }
            
    this.from = function(obj, foreignKeys, linkEntries)
    {
        var map = new Map(linkEntries);

        for(var prop in obj) {
                if(foreignKeys || obj.hasOwnProperty(prop))
                        map.put(prop, obj[prop]);
        }

        return map;
    }
    
    this.noop = function()
    {
            return this;
    }
    
    this.illegal = function()
    {
            throw new Error('can\'t do this with unlinked maps');
    }
    
    this.reverseIndexTableFrom = function(array, linkEntries)
    {
        var map = new Map(linkEntries);

        for(var i = 0, len = array.length; i < len; ++i) {
                var	entry = array[i],
                        list = map.get(entry);

                if(list) list.push(i);
                else map.put(entry, [i]);
        }

        return map;
    }

    this.cross = function(map1, map2, func, thisArg)
    {
        var linkedMap, otherMap;
    
        if(map1.isLinked) {
                linkedMap = map1;
                otherMap = map2;
        }
        else if(map2.isLinked) {
                linkedMap = map2;
                otherMap = map1;
        }
        else Map.illegal();
    
        for(var i = linkedMap.size; i--; linkedMap.next()) {
                var key = linkedMap.key();
                if(otherMap.contains(key))
                        func.call(thisArg, key, map1.get(key), map2.get(key));
        }
    
        return thisArg;
    }

    this.uniqueArray = function(array)
    {
            var map = new Map;
    
            for(var i = 0, len = array.length; i < len; ++i)
                    map.put(array[i]);
    
            return map.listKeys();
    }                                    
};

CMap.prototype.disableLinking = function(){
    this.isLinked = false;
    this.link = Map.noop;
    this.unlink = Map.noop;
    this.disableLinking = Map.noop;
    this.next = Map.illegal;
    this.key = Map.illegal;
    this.value = Map.illegal;
    this.removeAll = Map.illegal;
    this.each = Map.illegal;
    this.flip = Map.illegal;
    this.drop = Map.illegal;
    this.listKeys = Map.illegal;
    this.listValues = Map.illegal;

    return this;
};

CMap.prototype.hash = function(value){
    return value instanceof Object ? (value.__hash ||
            (value.__hash = 'object ' + ++arguments.callee.current)) :
            (typeof value) + ' ' + String(value);
};

CMap.prototype.hash.current = 0;            
CMap.prototype.link = function(entry){
        if(this.size === 0) {
                entry.prev = entry;
                entry.next = entry;
                this.current = entry;
        }
        else {
                entry.prev = this.current.prev;
                entry.prev.next = entry;
                entry.next = this.current;
                this.current.prev = entry;
        }
};

CMap.prototype.unlink = function(entry) {
        if(this.size === 0)
                this.current = undefined;
        else {
                entry.prev.next = entry.next;
                entry.next.prev = entry.prev;
                if(entry === this.current)
                        this.current = entry.next;
        }
};

CMap.prototype.get = function(key) {
        var entry = this[this.hash(key)];
        return typeof entry === 'undefined' ? undefined : entry.value;
};

CMap.prototype.put = function(key, value) {
        var hash = this.hash(key);

        if(this.hasOwnProperty(hash))
                this[hash].value = value;
        else {
                var entry = { key : key, value : value };
                this[hash] = entry;

                this.link(entry);
                ++this.size;
        }

        return this;
};

CMap.prototype.remove = function(key) {
        var hash = this.hash(key);

        if(this.hasOwnProperty(hash)) {
                --this.size;
                this.unlink(this[hash]);

                delete this[hash];
        }

        return this;
};

CMap.prototype.removeAll = function() {
        while(this.size)
                this.remove(this.key());

        return this;
};

CMap.prototype.contains = function(key) {
        return this.hasOwnProperty(this.hash(key));
};

CMap.prototype.isUndefined = function(key) {
        var hash = this.hash(key);
        return this.hasOwnProperty(hash) ?
                typeof this[hash] === 'undefined' : false;
};

CMap.prototype.next = function() {
        this.current = this.current.next;
};

CMap.prototype.key = function() {
        return this.current.key;
};

CMap.prototype.value = function() {
        return this.current.value;
};

CMap.prototype.each = function(func, thisArg) {
        if(typeof thisArg === 'undefined')
                thisArg = this;

        for(var i = this.size; i--; this.next()) {
                var n = func.call(thisArg, this.key(), this.value(), i > 0);
                if(typeof n === 'number')
                        i += n; // allows to add/remove entries in func
        }

        return this;
};

CMap.prototype.flip = function(linkEntries) {
        var map = new Map(linkEntries);

        for(var i = this.size; i--; this.next()) {
                var	value = this.value(),
                        list = map.get(value);

                if(list) list.push(this.key());
                else map.put(value, [this.key()]);
        }

        return map;
};

CMap.prototype.drop = function(func, thisArg) {
        if(typeof thisArg === 'undefined')
                thisArg = this;

        for(var i = this.size; i--; ) {
                if(func.call(thisArg, this.key(), this.value())) {
                        this.remove(this.key());
                        --i;
                }
                else this.next();
        }

        return this;
};

CMap.prototype.listValues = function() {
        var list = [];

        for(var i = this.size; i--; this.next())
                list.push(this.value());

        return list;
}

CMap.prototype.listKeys = function() {
        var list = [];

        for(var i = this.size; i--; this.next())
                list.push(this.key());

        return list;
}

CMap.prototype.toString = function() {
        var string = '[object Map';

        function addEntry(key, value, hasNext) {
                string += '    { ' + this.hash(key) + ' : ' + value + ' }' +
                        (hasNext ? ',' : '') + '\n';
        }

        if(this.isLinked && this.size) {
                string += '\n';
                this.each(addEntry);
        }

        string += ']';
        return string;
};