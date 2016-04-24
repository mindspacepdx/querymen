import test from 'tape'
import _ from 'lodash'
import {Param} from '../src/'

test('MenqueryParam', (t) => {
  let param = (value, options) => new Param('test', value, options)
  let date = new Date('2016-04-24')

  t.comment('MenqueryParam constructor type')
  let type = (value) => param(value).option('type')
  t.same(type('test'), String, 'should set type string automatically')
  t.same(type(123455), Number, 'should set type number automatically')
  t.same(type(false), Boolean, 'should set type boolean automatically')
  t.same(type(new Date()), Date, 'should set type date automatically')
  t.same(type(/test/i), RegExp, 'should set type regexp automatically')

  t.comment('MenqueryParam constructor options')
  let value = (...args) => param(...args).value()
  t.equal(value('foo', {default: 'test'}), 'foo', 'should not set default value string')
  t.equal(value(null, {default: 'test'}), 'test', 'should set default value string')
  t.equal(value(20, {default: 30}), 20, 'should not set default value number')
  t.equal(value(null, {default: () => 30}), 30, 'should set default value number by function')
  t.equal(value(null, {type: String, default: 30}), '30', 'should set default value with different type')
  t.equal(value('Bé_ free!', {normalize: false}), 'Bé_ free!', 'should not normalize value')
  t.equal(value('Bé_ free!', {normalize: true}), 'be free', 'should normalize value')
  t.equal(value('lower', {uppercase: false}), 'lower', 'should not uppercase value')
  t.equal(value('lower', {uppercase: true}), 'LOWER', 'should uppercase value')
  t.equal(value('UPPER', {lowercase: false}), 'UPPER', 'should not lowercase value')
  t.equal(value('UPPER', {lowercase: true}), 'upper', 'should lowercase value')
  t.equal(value('  trim   ', {trim: false}), '  trim   ', 'should not trim value')
  t.equal(value('  trim   ', {trim: true}), 'trim', 'should trim value')
  t.equal(value('123', {get: (value) => value + '!'}), '123!', 'should set getter value')
  t.equal(value('123', {set: (value) => value + '!'}), '123!', 'should set setter value')

  t.comment('MenqueryParam constructor options with multiple value')
  value = (value, options) => param(value, _.assign(options, {multiple: true})).value()
  t.same(value('foo,bar', {default: 'test'}), ['foo', 'bar'], 'should not set default value string')
  t.same(value('Bé_!, Bê!', {normalize: false}), ['Bé_!', 'Bê!'], 'should not normalize value')
  t.same(value('Bé_!, Bê!', {normalize: true}), ['be', 'be'], 'should normalize value')
  t.same(value('low,wol', {uppercase: false}), ['low', 'wol'], 'should not uppercase value')
  t.same(value('low,wol', {uppercase: true}), ['LOW', 'WOL'], 'should uppercase value')
  t.same(value('UP,PU', {lowercase: false}), ['UP', 'PU'], 'should not lowercase value')
  t.same(value('UP,PU', {lowercase: true}), ['up', 'pu'], 'should lowercase value')
  t.same(value(' tr ,  rt', {trim: false}), [' tr ', '  rt'], 'should not trim value')
  t.same(value(' tr ,  rt', {trim: true}), ['tr', 'rt'], 'should trim value')
  t.same(value('123,321', {get: (value) => value + '!'}), ['123!', '321!'], 'should set getter value')
  t.same(value('123,321', {set: (value) => value + '!'}), ['123!', '321!'], 'should set setter value')

  t.comment('MenqueryParam value')
  value = (val, type) => param(val, {type: type}).value()
  let dateValue = (val) => value(val, Date)
  t.equal(value(23, String), '23', 'should convert 23 to "23"')
  t.equal(value('23', Number), 23, 'should convert "23" to 23')
  t.equal(value('1', Boolean), true, 'should convert "1" to true')
  t.equal(value('0', Boolean), false, 'should convert "0" to false')
  t.equal(value(1, Boolean), true, 'should convert 1 to true')
  t.equal(value(0, Boolean), false, 'should convert 0 to false')
  t.equal(value('true', Boolean), true, 'should convert "true" to true')
  t.equal(value('false', Boolean), false, 'should convert "false" to false')
  t.same(value('test', RegExp), /test/i, 'should convert "test" to /test/i')
  t.same(value(123, RegExp), /123/i, 'should convert 123 to /123/i')
  t.same(dateValue('2016-04-24'), date, 'should convert sameo string to date')
  t.same(dateValue('1461456000000'), date, 'should convert timestamp string to date')
  t.same(dateValue(1461456000000), date, 'should convert number to date')

  t.comment('MenqueryParam value with multiple value')
  value = (val, type) => param(val, {type: type, multiple: true}).value()
  t.same(value('23,24', String), ['23', '24'], 'should convert to string')
  t.same(value('23,24', Number), [23, 24], 'should convert to number')
  t.same(value('1,0,true,false', Boolean), [true, false, true, false], 'should convert to boolean')
  t.same(value('foo,bar', RegExp), [/foo/i, /bar/i], 'should convert to regexp')
  t.same(dateValue('2016-04-24,1461456000000'), [date, date], 'should convert to date')

  t.comment('MenqueryParam validate')
  let validate = (...args) => param(...args).validate()
  t.true(validate(), 'should validate no options with success')
  t.true(validate(null, {required: false}), 'should validate non required with success')
  t.false(validate(null, {required: true}), 'should validate required with error')
  t.true(validate('test', {required: true}), 'should validate required with success')
  t.true(validate(null, {min: 4}), 'should validate null value min with success')
  t.false(validate(3, {min: 4}), 'should validate min with error')
  t.true(validate(4, {min: 4}), 'should validate min with success')
  t.true(validate(null, {max: 4}), 'should validate null value max with success')
  t.false(validate(5, {max: 4}), 'should validate max with error')
  t.true(validate(4, {max: 4}), 'should validate max with success')
  t.true(validate(null, {minlength: 2}), 'should validate null value minlength with success')
  t.false(validate('a', {minlength: 2}), 'should validate minlength with error')
  t.true(validate('ab', {minlength: 2}), 'should validate minlength with success')
  t.true(validate(null, {maxlength: 2}), 'should validate null value maxlength with success')
  t.false(validate('abc', {maxlength: 2}), 'should validate maxlength with error')
  t.true(validate('ab', {maxlength: 2}), 'should validate maxlength with success')
  t.true(validate(null, {enum: ['ab']}), 'should validate null value enum with success')
  t.false(validate('a', {enum: ['ab']}), 'should validate enum with error')
  t.true(validate('ab', {enum: ['ab']}), 'should validate enum with success')
  t.true(validate(null, {match: /^\D+$/i}), 'should validate null value match with success')
  t.false(validate('3', {match: /^\D+$/i}), 'should validate match with error')
  t.true(validate('ab', {match: /^\D+$/i}), 'should validate match with success')
  t.false(param().validate((err) => err), 'should validate with callback')

  t.comment('MenqueryParam validate with multiple value')
  validate = (value, options) => param(value, _.assign(options, {multiple: true})).validate()
  t.false(validate('test,', {required: true}), 'should validate required with error')
  t.true(validate('test', {required: true}), 'should validate required with success')
  t.false(validate('3,4', {min: 4}), 'should validate min with error')
  t.true(validate('4,5', {min: 4}), 'should validate min with success')
  t.false(validate('4,5', {max: 4}), 'should validate max with error')
  t.true(validate('3,4', {max: 4}), 'should validate max with success')
  t.false(validate('ab,a', {minlength: 2}), 'should validate minlength with error')
  t.true(validate('ab,abc', {minlength: 2}), 'should validate minlength with success')
  t.false(validate('ab,abc', {maxlength: 2}), 'should validate maxlength with error')
  t.true(validate('ab,a', {maxlength: 2}), 'should validate maxlength with success')
  t.false(validate('ab,a', {enum: ['ab']}), 'should validate enum with error')
  t.true(validate('ab,ab', {enum: ['ab']}), 'should validate enum with success')
  t.false(validate('ab,3', {match: /^\D+$/i}), 'should validate match with error')
  t.true(validate('ab,a', {match: /^\D+$/i}), 'should validate match with success')

  t.comment('MenqueryParam parse')
  let parse = (...args) => param(...args).parse()
  t.same(parse(), {}, 'should parse nothing')
  t.same(parse(123), {test: 123}, 'should parse $eq as default')
  t.same(parse('123,456', {multiple: true}), {test: {$in: ['123', '456']}}, 'should parse $in')
  t.same(parse('123', {operator: '$ne'}), {test: {$ne: '123'}}, 'should parse $ne')
  t.same(parse('123,456', {operator: '$ne', multiple: true}), {test: {$nin: ['123', '456']}}, 'should parse $nin')
  t.same(parse(123, {operator: '$gt'}), {test: {$gt: 123}}, 'should parse $gt')
  t.same(parse(123, {operator: '$gte'}), {test: {$gte: 123}}, 'should parse $gte')
  t.same(parse(123, {operator: '$lt'}), {test: {$lt: 123}}, 'should parse $lt')
  t.same(parse(123, {operator: '$lte'}), {test: {$lte: 123}}, 'should parse $lte')

  t.comment('MenqueryParam parse $or')
  let or = (value, options) => param(value, _.assign({paths: ['p1', 'p2']}, options)).parse()
  let eqMultiple = {$or: [{p1: {$in: ['1', '2']}}, {p2: {$in: ['1', '2']}}]}
  let neMultiple = {$or: [{p1: {$nin: ['1', '2']}}, {p2: {$nin: ['1', '2']}}]}
  t.same(or(123), {$or: [{p1: 123}, {p2: 123}]}, 'should parse $eq')
  t.same(or('1,2', {multiple: true}), eqMultiple, 'should parse $in')
  t.same(or(123, {operator: '$ne'}), {$or: [{p1: {$ne: 123}}, {p2: {$ne: 123}}]}, 'should parse $ne')
  t.same(or('1,2', {operator: '$ne', multiple: true}), neMultiple, 'should parse $nin')
  t.same(or(123, {operator: '$gt'}), {$or: [{p1: {$gt: 123}}, {p2: {$gt: 123}}]}, 'should parse $gt')
  t.same(or(123, {operator: '$gte'}), {$or: [{p1: {$gte: 123}}, {p2: {$gte: 123}}]}, 'should parse $gte')
  t.same(or(123, {operator: '$lt'}), {$or: [{p1: {$lt: 123}}, {p2: {$lt: 123}}]}, 'should parse $lt')
  t.same(or(123, {operator: '$lte'}), {$or: [{p1: {$lte: 123}}, {p2: {$lte: 123}}]}, 'should parse $lte')

  t.comment('MenqueryParam option')
  let optionParam = param()
  t.true(param().option('paths'), 'should get an option')
  t.false(param().option('test'), 'should not get a nonexistent option')
  t.true(optionParam.option('test', true), 'should set a custom option')
  t.true(optionParam.option('test'), 'should get a custom option')

  t.comment('MenqueryParam formatter')
  let fParam = param()
  fParam.formatter('capitalize', (capitalize, value, param) => {
    t.equal(param.name, 'test', 'should pass param object to formatter method')
    return capitalize ? _.capitalize(value) : value
  })
  t.true(param().formatter('default'), 'should get formatter')
  t.false(param().formatter('capitalize'), 'should not get nonexistent formatter')
  t.true(fParam.formatter('capitalize'), 'should get custom formatter')
  t.equal(fParam.value('TEST'), 'TEST', 'should not apply custom formatter if option was not set')
  t.true(fParam.option('capitalize', true), 'should set formatter option to true')
  t.equal(fParam.value('TEST'), 'Test', 'should apply custom formatter')
  t.false(fParam.option('capitalize', false), 'should set formatter option to false')
  t.equal(fParam.value('TEST'), 'TEST', 'should not apply custom formatter if option is false')

  t.comment('MenqueryParam parser')
  let pParam = param(null, {multiple: true})
  pParam.parser('toLower', (toLower, value, param) => {
    t.equal(param.name, 'test', 'should pass param object to parser method')
    return pParam.formatter('lowercase')(toLower, value, param)
  })
  t.false(param().parser('toLower'), 'should not get nonexistent parser')
  t.true(pParam.parser('toLower'), 'should get custom parser')
  t.same(pParam.parse('TEST'), {test: 'TEST'}, 'should not apply custom parser if option was not set')
  t.true(pParam.option('toLower', true), 'should set parser option to true')
  t.same(pParam.parse('TEST'), {test: 'test'}, 'should apply custom parser')
  t.same(pParam.parse('TEST,FOO'), {test: {$in: ['test', 'foo']}}, 'should apply custom parser to multiple values')
  t.false(pParam.option('toLower', false), 'should set parser option to false')
  t.same(pParam.parse('TEST'), {test: 'TEST'}, 'should not apply custom parser if option is false')

  t.comment('MenqueryParam validator')
  let vParam = param(null, {multiple: true})
  vParam.validator('isPlural', (isPlural, value, param) => {
    t.equal(param.name, 'test', 'should pass param object to validator method')
    return {valid: !isPlural || value.toLowerCase().substr(-1) === 's'}
  })
  t.true(param().validator('required'), 'should get validator')
  t.false(param().validator('isPlural'), 'should not get nonexistent validator')
  t.true(vParam.validator('isPlural'), 'should get custom validator')
  t.true(vParam.validate('test'), 'should not apply custom validator if option was not set')
  t.true(vParam.option('isPlural', true), 'should set validator option to true')
  t.false(vParam.validate('test'), 'should apply custom validator and validate false')
  t.false(vParam.validate('tests,FOO'), 'should apply custom validator to multiple values and validate false')
  t.true(vParam.validate('tests'), 'should apply custom validator and validate true')
  t.true(vParam.validate('tests,FOOS'), 'should apply custom validator to multiple values and validate true')
  t.false(vParam.option('isPlural', false), 'should set validator option to false')
  t.true(vParam.validate('test'), 'should not apply custom validator if option is false')

  t.end()
})
