```
	 _ __ ___  _   _  ___  _ __  
	| '_ ` _ \| | | |/ _ \| '_ \ 
	| | | | | | |_| | (_) | | | |
	|_| |_| |_|\__,_|\___/|_| |_|

	The lightweight wiki based on 
	   Windows Azure Storage
```

# Features

 1. Directly upload/download content from Azure Storage, allowing high scale at low cost.
 1. Integrates with twitter for authentication.
 1. Allow public read/write access, or limit access to selected users.
 1. Use markdown to edit articles.
 1. Ideal for small teams collaborating on documentation.
 1. It's really fast and simple!

# Installation instructions

Prerequisites:

 * A Windows Azure Account
 * Git
 * (optional) A [twitter developer](https://dev.twitter.com) account
 * (optional) [Windows Azure CLI tool for Mac and Linux](https://github.com/windowsazure/azure-sdk-tools-xplat) (also works on Windows!)

The application will use Twitter to authenticate users (unless you choose to make the wiki fully public read/write access). You will need to sign up for a twitter developer account, and register an application. Your application key and secret can then be used for Muon.

### 1. Create a storage account in Windows Azure

You can either do this in the [Portal](https://manage.windowsazure.com/#Workspace/StorageExtension/storage), or using the command line:

```
azure account storage create --location "North Europe" THE_NAME_OF_YOUR_STORAGE_ACCOUNT
```

### 2. Create a website

You can either do this in the [Portal](https://manage.windowsazure.com/#Workspace/WebsiteExtension/websites), or using the command line. You must enable Git publishing.

```
azure site create NAME_OF_YOUR_WEBSITE --git --location "North Europe"
```

### 3. Deploy the website

Use git to clone Muon, and publish it to your website:

```
git clone https://github.com/richorama/muon.git
cd muon
git remote add azure https://NAME_OF_YOUR_WEBSITE.scm.azurewebsites.net/NAME_OF_YOUR_WEBSITE.git
git push azure master
```

### 4. Configure Muon

Muon uses a number of app settings to configure the permissions and settings. You can create these on the command line or enter them into the Portal:

```
setlocal
set site=NAME_OF_YOUR_WEBSITE

azure site config add storageaccount=THE_NAME_OF_YOUR_STORAGE_ACCOUNT %site%
azure site config add storagekey=YOUR_STORAGE_KEY %SITE%
azure site config add readers=* %site%
azure site config add editors=* %site%
azure site config add twitterkey=TWITTER_APP_KEY %site%
azure site config add twittersecret=TWITTER_APP_SECRET %site%
```

The setting are as follows:

__storageaccount__ : The name of your window Azure Storage Account

__storagekey__ : The key for your window Azure Storage Account

__readers__ : * to allow public read access, otherwise a comma separated list of twitter usernames for read access

__editors__ : * to allow public write access, otherwise a comma separated list of twitter usernames for write access

__twitterkey__ : The key for an app you have registered in twitter (only required if you don't have * for editors and readers)

__twittersecret__ : The secret for an app you have registered in twitter (only required if you don't have * for editors and readers)


The portal should look something like this:

![Screenshot of the Windows Azure Portal](http://wp.me/a17TJV-bl)
