/**
 * Module to create unique ID strings.
 **/
module.exports = Identifier = {

    CHARS : 'ABCDEF1234567890',

    LENGTH : 8,

    /**
     * Identifier.generate(length) -> String
     * - length (Integer)
     **/
    generate : function (length) {
        var id = '',
            randomNumber;

        length = length || this.LENGTH;

        for (var i = 0; i < length; i++) {
            randomNumber = Math.floor(Math.random() * this.CHARS.length);
            id += this.CHARS.substring(randomNumber, randomNumber + 1);
        }

        return id;
    }
};