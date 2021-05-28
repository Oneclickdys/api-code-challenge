let sql = `
CREATE TABLE IF NOT EXISTS \`education_levels\` (
    \`guid\` VARCHAR(38) NOT NULL,
    \`code\` VARCHAR(4) NULL,
    \`level\` VARCHAR(80) NULL,
    \`order\` INT NULL,
    \`created_at\` TIMESTAMP NOT NULL,
    \`updated_at\` TIMESTAMP NULL,
    \`deleted_at\` TIMESTAMP NULL,
    PRIMARY KEY (\`guid\`),
    UNIQUE INDEX \`code_UNIQUE\` (\`code\` ASC))
  ENGINE = InnoDB;

INSERT INTO education_levels (guid,\`code\`,\`level\`,\`order\`,created_at) VALUES ('dddf3f87-4baf-446e-95fe-0dac99e19c02','EP','Primaria',0,NOW());
`;

module.exports = {
    "up": sql,
    "down": ""
}