# Api code challenge

## Code challenge
Create crud of education years according to the data model ./api/_sql/der.mwb

## Install dev localhost
### Install modules
```
npm install
```
### env file
Copy .env_sample to .env and configure database parameters
### Execute migrations
```
node .\mysql-migrations.js up
```

### Launch dev server
```
swagger project start
```
```
npm run dev
```
### Launch yaml config validation
```
npm run validate
```
### Test API
```
npm run test
```
### Launch server
```
npm start
```

## Mysql migrations
### Add migration
```
node .\mysql-migrations.js add migration MIGRATION_NAME_HERE
```
### Update migrations
```
node .\mysql-migrations.js up
```
-------------

@oneclick.es
