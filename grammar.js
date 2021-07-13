const PREC = {
  COMMENT: -100, // /* */ //
  SEQUENCE: -10, // ,
  ASSIGNMENT: -2, // = += -= *=
  SELECTION: -1, // ?:
  DEFAULT: 0,
  LOGICAL_OR: 1, // ||
  LOGICAL_AND: 2, // &&
  INCLUSIVE_OR: 3, // |
  EXCLUSIVE_OR: 4, // ^
  BITWISE_AND: 5, // &
  EQUALITY: 6, // == !=
  RELATIONAL: 7, // >= <= < >
  SHIFT: 9, // >> <<
  ADDDITIVE: 10, // + -
  MULTIPLICATIVE: 11, // *
  UNARY: 15, // !a
  PREFIX: 15, // --a
  POSTFIX: 18, // a--
  SUBSCRIPT: 18, // []
  CALL: 18, // func()
  FIELD: 18, // .
  GROUPING: 20, // ()
};
module.exports = grammar({
  name: 'glsl',

  word: ($) => $.identifier,

  extras: ($) => [/[\t\n ]+/, $.comment],
  rules: {
    // TODO: add the actual grammar rules
    // identifier: ($) => /[a-zA-Z_]\w*/,

    // TRANSLATION_UNIT        : DECLARATION | FUNCTION_DEFINITON
    translation_unit: ($) => repeat1($._external_declaration),

    _external_declaration: ($) =>
      choice(
        field('declarator', $.function_definition),
        field('body', $.declaration)
      ),

    // FUNCTION_DEFINITION     : FUNCTION_DECLARATION STATEMENT_LIST
    function_definition: ($) =>
      choice(
        seq(
          field('declarator', $.function_declaration),
          ')',
          optional(field('body', $.statement_list))
        )
      ),

    // FUNCTION_DECLARATION    : FUNCTION_HEADER FUNCTION_PARAMETER_LIST
    // FUNCTION_HEADER         : FULLY_SPECIFIED_TYPE IDENTIFIER
    function_declaration: ($) =>
      seq(
        field('type', $.fully_specified_type), // TODO
        field('name', $.identifier),
        '(',
        optional(field('parameters', $.function_parameter_list))
      ),

    // FUNCTION_PARAMETER_LIST : PARAMETER_DECLARATION ...
    function_parameter_list: ($) => commaSep1($.parameter_declaration),
    // PARAMETER_DECLARATION   : TYPE_QUALIFIER_LIST PARAMETER_DECLARATOR
    parameter_declaration: ($) =>
      seq(
        optional(field('type', $.type_qualifier_list)),
        field('declarator', choice($.parameter_declarator, $.type_specifier))
      ),
    // PARAMETER_DECLARATOR    : TYPE_SPECIFIER IDENTIFIER ARRAY_SPECIFIER_LIST
    parameter_declarator: ($) =>
      seq(
        field('type', $.type_specifier),
        field('declarator', $._field_declarator)
      ),

    _array_specifier_list: ($) =>
      repeat1(choice('[]', seq('[', $.constant_expression, ']'))),

    _field_declarator: ($) => choice($.identifier, $.array_declarator),

    array_declarator: ($) =>
      seq(field('declarator', $.identifier), $._array_specifier_list),

    type_specifier: ($) =>
      seq($.primitive_type, optional($._array_specifier_list)),

    _type_specifier_nonarray: ($) =>
      choice(
        $.primitive_type,
        seq(
          'struct',
          optional(field('declarator', $.identifier)),
          '{',
          field('body', $.struct_declaration_list),
          '}'
        ),
        $.identifier
      ),

    primitive_type: ($) =>
      choice(
        'void',
        'float',
        'double',
        'int',
        'uint',
        'bool',
        'vec2',
        'vec3',
        'vec4',
        'dvec2',
        'dvec3',
        'dvec4',
        'bvec2',
        'bvec3',
        'bvec4',
        'ivec2',
        'ivec3',
        'ivec4',
        'uvec2',
        'uvec3',
        'uvec4',
        'mat2',
        'mat3',
        'mat4',
        'mat2x2',
        'mat2x3',
        'mat2x4',
        'mat3x2',
        'mat3x3',
        'mat3x4',
        'mat4x2',
        'mat4x3',
        'mat4x4',
        'dmat2',
        'dmat3',
        'dmat4',
        'dmat2x2',
        'dmat2x3',
        'dmat2x4',
        'dmat3x2',
        'dmat3x3',
        'dmat3x4',
        'dmat4x2',
        'dmat4x3',
        'dmat4x4',
        'atomic_uint',
        'sampler1d',
        'sampler2d',
        'sampler3d',
        'samplercube',
        'sampler1DShadow',
        'sampler2DShadow',
        'samplerCubeShadow',
        'sampler1DArray',
        'sampler2DArray',
        'sampler1DArrayShadow',
        'sampler2DArrayShadow',
        'samplerCubeArray',
        'samplerCubeArrayShadow',
        'isampler1D',
        'isampler2D',
        'isampler3D',
        'isamplerCube',
        'isampler1DArray',
        'isampler2DArray',
        'isamplerCubeArray',
        'usampler1D',
        'usampler2D',
        'usampler3D',
        'usamplerCube',
        'usampler1DArray',
        'usampler2DArray',
        'usamplerCubeArray',
        'sampler2DRect',
        'sampler2DRectshadow',
        'isampler2DRect',
        'usampler2DRect',
        'samplerBuffer',
        'isamplerBuffer',
        'usamplerBuffer',
        'sampler2DMS',
        'isampler2DMS',
        'usampler2DMS',
        'sampler2DMSArray',
        'isampler2DMSArray',
        'usampler2DMSArray',
        'image1D',
        'iimage1D',
        'uimage1D',
        'image2D',
        'iimage2D',
        'uimage2D',
        'image3D',
        'iimage3D',
        'uimage3D',
        'image2DRect',
        'iimage2DRect',
        'uimage2DRect',
        'imageCube',
        'iimageCube',
        'uimageCube',
        'imageBuffer',
        'iimageBuffer',
        'uimageBuffer',
        'image1DArray',
        'iimage1DArray',
        'uimage1DArray',
        'image2DArray',
        'iimage2DArray',
        'uimage2DArray',
        'imageCubeArray',
        'iimageCubeArray',
        'uimageCubeArray',
        'image2DMS',
        'iimage2DMS',
        'uimage2DMS',
        'image2DMSArray',
        'iimage2DMSArray',
        'uimage2DMSArray'
      ),

    struct_declaration_list: ($) => repeat1($.struct_declaration),

    struct_declaration: ($) =>
      seq(
        optional($.type_qualifier_list),
        field('type', $.type_specifier),
        field('declarator', $.struct_declarator_list),
        ';'
      ),
    struct_declarator_list: ($) =>
      seq($.struct_declarator, optional(seq(',', $.struct_declarator_list))),

    struct_declarator: ($) => $._field_declarator,
    type_qualifier_list: ($) => repeat1($.type_qualifier),

    type_qualifier: ($) =>
      choice(
        $.storage_qualifier,
        $.layout_qualifier,
        $.precision_qualifier,
        $.interpolation_qualifier,
        $.invariant_qualifier,
        $.precise_qualifier
      ),
    storage_qualifier: ($) =>
      choice(
        'const',
        'inout',
        'in',
        'out',
        'centroid',
        'patch',
        'sample',
        'uniform',
        'buffer',
        'shared',
        'coherent',
        'volatile',
        'restrict',
        'readonly',
        'writeonly',
        'subroutine',
        seq('subroutine', '(', type_name_list, ')')
      ),

    layout_qualifier: ($) =>
      seq(
        'LAYOUT',
        '(',
        seq($.layout_qualifier_id, repeat(seq(',', $.layout_qualifier_id))),
        ')'
      ),
    layout_qualifier_id: ($) =>
      choice(
        seq(
          field('declarator', $.identifier),
          optional(seq('=', field('value', $.constant_expression)))
        ),
        'shared'
      ),
    precision_qualifier: ($) => choice('highp', 'mediump', 'lowp'),
    interpolation_qualifier: ($) => choice('smooth', 'flat', 'noperspective'),
    invariant_qualifier: ($) => 'invariant',
    precise_qualifier: ($) => 'precise',

    // TODO: constant expression
    binary_expression: ($) =>
      choice(
        ...[
          ['>', PREC.RELATIONAL],
          ['<', PREC.RELATIONAL],
          ['>=', PREC.RELATIONAL],
          ['<=', PREC.RELATIONAL],
          ['==', PREC.EQUALITY],
          ['!=', PREC.EQUALITY],
          ['&&', PREC.LOGICAL_AND],
          ['||', PREC.LOGICAL_OR],
          ['+', PREC.ADDDITIVE],
          ['-', PREC.ADDDITIVE],
          ['*', PREC.MULTIPLICATIVE],
          ['/', PREC.MULTIPLICATIVE],
          ['&', PREC.BITWISE_AND],
          ['|', PREC.INCLUSIVE_OR],
          ['^', PREC.EXCLUSIVE_OR],
          ['%', PREC.MULTIPLICATIVE],
          ['<<', PREC.SHIFT],
          ['>>', PREC.SHIFT],
        ].map(([operator, precedence]) =>
          prec.left(
            precedence,
            seq(
              field('left', $.expression),
              field('operator', operator),
              field('right', $.expression)
            )
          )
        )
      ),

    unary_expression: ($) =>
      choice(
        ...[
          ['+', PREC.UNARY],
          ['-', PREC.UNARY],
          ['!', PREC.UNARY],
          ['~', PREC.UNARY],
        ].map(([operator, precedence]) =>
          prec.right(
            precedence,
            seq(field('operator', operator), field('operand', $.expression))
          )
        )
      ),

    update_expression: ($) =>
      choice(
        prec.right(
          PREC.PREFIX,
          choice(seq('++', $.expression), seq('--', $.expression))
        ),
        prec.left(
          PREC.POSTFIX,
          choice(seq($.expression, '++'), seq($.expression, '--'))
        )
      ),

    array_access: ($) =>
      prec.left(
        PREC.SUBSCRIPT,
        seq(
          field('array', $.primary_expression),
          '[',
          field('index', $.expression),
          ']'
        )
      ),

    field_access: ($) =>
      prec.left(
        PREC.FIELD,
        seq(
          field('object', $.primary_expression),
          '.',
          field('field', $.identifier)
        )
      ),

    function_call: ($) =>
      seq(
        field('function', choice($.type_specifier, $.primary_expression)),
        '(',
        optional('void', $.function_call_parameter_list),
        ')'
      ),

    function_call_parameter_list: ($) => seq(),

    // DECLARATION             : INIT_DECLARATOR_LIST | BLOCK_DECLARATION | FUNCTION_DECLARATION
    _declaration: ($) =>
      choice(
        $._init_declarator_list,
        $._block_declaration,
        $.function_declaration
      ),

    integer_constant: ($) => /[0-9]+/,
    floating_constant: ($) => /[0-9]+\.[0-9]+/,

    comment: ($) =>
      token(
        prec(
          PREC.COMMENT,
          choice(
            seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
            seq('#', /.*/, '\n'),
            seq('//', /.*/, '\n')
          )
        )
      ),
    identifier: ($) => /[_a-zA-Z][_a-zA-Z0-9]*/,
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSepTrailing(recurSymbol, rule) {
  return choice(rule, seq(recurSymbol, ',', rule));
}
