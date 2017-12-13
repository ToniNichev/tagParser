var parserPlugIns = {
    // write your plug-ins here, to extend parcer functionality 
    $$: function(param, data) {
        param = param.split('$$').join('')
        try {
            var result = eval('data.' + param);
            if(typeof result != 'undefined')
             return result;
            else
             return ''
        }
        catch(e){
            console.log("Missing parameter:" + params[0]);
            return ''
        }
    },
 
    js: function(param, body, data) {
        eval(body);
        return '';
    },

    printObject: function(param, data) {
        return JSON.stringify(data)
    },

    printObjectMember: function(param, data) {
        return JSON.stringify(data[param])
    },

}