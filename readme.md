```
	 _ __ ___  _   _  ___  _ __  
	| '_ ` _ \| | | |/ _ \| '_ \ 
	| | | | | | |_| | (_) | | | |
	|_| |_| |_|\__,_|\___/|_| |_|

	The lightweight wiki based on 
	   Windows Azure Storage
```

# Installation instructions.

Prerequisites:

 * A Windows Azure Account
 * Git
 * (optional) A [twitter developer](https://dev.twitter.com) account
 * (optional) [Windows Azure CLI tool for Mac and Linux](https://github.com/windowsazure/azure-sdk-tools-xplat) (also works on Windows!)


## 1. Create a storage account in Windows Azure

You can either do this in the [Portal](https://manage.windowsazure.com/#Workspace/StorageExtension/storage), or using the terminal:

```
azure account storage create --location "North Europe" THE_NAME_OF_YOUR_STORAGE_ACCOUNT
```

## 2. Create a website

You can either do this in the [Portal](https://manage.windowsazure.com/#Workspace/WebsiteExtension/websites), or using the terminal. You must enable Git publishing.

```
azure site create NAME_OF_YOUR_WEBSITE --git --location "North Europe"
```

## 3. Deploy the website

Use git to clone Muon, and publish it to your website:

```
git clone https://github.com/richorama/muon.git
cd muon
git remote add azure https://NAME_OF_YOUR_WEBSITE.scm.azurewebsites.net/NAME_OF_YOUR_WEBSITE.git
git push azure master
```

## 4. Configure Muon

Muon uses a number of app setting to configure the permissions and settings. You can create these on the command line:

```
setlocal
set site=NAME_OF_YOUR_WEBSITE

azure site config add storageaccount=THE_NAME_OF_YOUR_STORAGE_ACCOUNT %site%
azure site config add storagekey=YOUR_STORAGE_KEY %SITE%
azure site config add twitterkey=TWITTER_APP_KEY %site%
azure site config add twittersecret=TWITTER_APP_SECRET %site%
azure site config add readers=* %site%
azure site config add editors=* %site%
```

