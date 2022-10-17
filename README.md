<br/>
<p align="center">
<img width="50%" src="https://user-images.githubusercontent.com/12374295/90165603-beb56280-dd4d-11ea-83ce-3b4c6ab7d2da.png" alt="Technica Logo">
</p>

The Technica platform is an open-source and easy to use online platform for hackathons to use, built with the COVID-19 pandemic in mind.

## ✅&nbsp; Requirements
Exact installation details are in the next section, but the whole platform uses Node.js.
To use the platform for your hackathon, you'll need an AWS account.

The platform's backend uses AWS Lambda and DynamoDB, with the deployment being handled by Serverless.

The platform's frontend uses Vue.js, and is deployed as a static site onto AWS S3. CDN hosting is handled by AWS CloudFront.

## 🚀&nbsp; Installation

#### Frontend
To run the frontend on your local machine:
1. In the `frontend` directory of this repo, run the following: `npm i`
2. Run `npm run serve` to build and locally host the frontend web app 

```shell
cd frontend
npm i
npm run serve
```

#### Backend
Each folder in `backend` contains a "service" of the platform's backend.
To develop or use any given service, you'll need to be in the service's folder. (i.e. `backend/teams` or `backend/users`)

First, set your AWS credentials in your terminal for serverless to use:
> NOTE: Please be very careful with these keys - treat them like your social security number. Never commit them publicly to Github or share with anyone else.

For Linux/OSX:
```shell
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```
For Windows:
```
set AWS_ACCESS_KEY_ID=<your-key-here>
set AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

Next, install the service's dependencies with `npm i`.

You're good to go! Here are some useful commands:

| I want to                 | command                            |
|---------------------------|------------------------------------|
| Deploy the service to AWS |`sls deploy [-s <STAGE>]`           |
| Test the service          |`sls invoke test`                   |
| Invoke the service        |`sls invoke -f <FUNCTION> -d <data>`|

This list is probably not exhaustive, so [Serverless' documentation](https://www.serverless.com/framework/docs/) should come in handy.

## 📫&nbsp; Have a question? Want to chat? Ran into a problem?
The project is *currently under development* and open-source support is not currently a top priority (it will be once the platform has been finished).
However, feel free to contact tech@gotechnica.org with anything!

## 📘&nbsp; License
[MIT © Technica](https://github.com/gotechnica/platform-2020/blob/master/LICENSE)
