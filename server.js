var azure = require("azure");
var express = require('express');
var everyauth = require("everyauth");
var app = express();
BlueskyStore = require('connect-bluesky')(express);

var storageAccount = process.env.STORAGEACCOUNT;
var storageKey = process.env.STORAGEKEY;

var notSetupCorrectly = (!process.env.EDITORS || !process.env.READERS || !process.env.STORAGEACCOUNT || !process.env.STORAGEKEY);

var editors = {};
(process.env.EDITORS || "").split(",").forEach(function(username){
  editors[username.trim().toLowerCase()] = true;
});

var readers = {};
(process.env.READERS || "").split(",").forEach(function(username){
  readers[username.trim().toLowerCase()] = true;
});

if (storageAccount && storageKey){
  var blobService = azure.createBlobService(storageAccount, storageKey);
  blobService.createContainerIfNotExists("wiki", function(error){});
  //blobService.createContainerIfNotExists("wikicontent", function(error){});
  blobService.createContainerIfNotExists("wikiusers", function(error){});
  blobService.createContainerIfNotExists("$root", {publicAccessLevel:"blob"}, function(error){
    blobService.createBlockBlobFromFile("$root", "index.htm", "index.htm", function(error){});
    var json = { authservice: "http://" + process.env.APP_POOL_ID + ".azurewebsites.net/" };
    blobService.createBlockBlobFromText("$root", "wiki-config.json", JSON.stringify(json), function(error){});
  });
}



// configure everyauth
everyauth.everymodule
  .findUserById( function (id, callback) {
    getUserBlob(id, callback);
    //callback(null, usersByTwitId[id]);
  });

if (process.env.TWITTERKEY && process.env.TWITTERSECRET){
  everyauth
  .twitter
    .consumerKey(process.env.TWITTERKEY)
    .consumerSecret(process.env.TWITTERSECRET)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      getTwitterUser(twitUser, function(user){ });
      return {id:"twitter_" + twitUser.id_str};
    })
    .redirectPath('http://' + storageAccount + '.blob.core.windows.net/index.htm');
}


app.enable("jsonp callback");

if (storageAccount && storageKey){
  app.use(express.bodyParser())
    .use(express.cookieParser('c390ceec-dbc0-47b0-8c79-b8d208048ee0'))
    .use(express.session({
      secret: 'baabb5ff-4044-4939-ac9c-39b4d8c90218', 
      store: new BlueskyStore({
        account: storageAccount,
        key: storageKey,
        table: 'expresssession'
      })
    }))
    .use(everyauth.middleware(app)
    .use(app.router));
}

// express routes
app.get("/login", function(req, res){
  var permission;

  if (!req.user && isReader("*")){
    // allow anonymous browsing
    permission = "rl";
    var container = blobService.generateSharedAccessSignature("wiki", undefined, { AccessPolicy : { Permissions : permission, Expiry : getDate(), Start : new Date() } });
    res.jsonp({
      url: container.url(),
      permission:permission
    });
    return;
  }

	if (!req.user){
		res.jsonp({failed:"login"});
		return;
	}

  if (isReader(req.user.screen_name)){
    permission = "rl"
  }

  if (isEditor(req.user.screen_name)){
    permission = "rwdl";
  }

  if (!permission){
    res.jsonp({failed:"permission"});
    return;    
  }

	var container = blobService.generateSharedAccessSignature("wiki", undefined, { AccessPolicy : { Permissions : permission, Expiry : getDate(), Start : new Date() } });
	res.jsonp({
		url: container.url(),
		user:req.user,
    permission:permission
	});
});

app.get("/", function(req, res){
  if (notSetupCorrectly) {
    res.end("<html><body>Please set up Muon correctly<br/><br/><a href='https://github.com/richorama/muon#4-configure-muon'>Configure Muon</a></body></html>");
    return;
  }

  res.redirect('http://' + storageAccount + '.blob.core.windows.net/index.htm');
})

app.listen(process.env.port || 3000); 

function getDate(){
	var date = new Date();
	date.setHours((date).getHours() + 1);
	return date;
}

function getTwitterUser(twitterUser, cb){
  getUserBlob("twitter_" + twitterUser.id_str, function(error,blobUser){
    if (!blobUser){
      createUserBlob("twitter_" + twitterUser.id_str, twitterUser, function(){
        cb(twitterUser);
      });
    } else {
      cb(twitterUser);
    }
  })
}

function getUserBlob(id, cb){
  blobService.getBlobToText("wikiusers", id, function (error, text){
    if (text){
      cb(undefined,JSON.parse(text));
    } else {
      cb();
    }
  });
}

function createUserBlob(id, user, cb){
  blobService.createBlockBlobFromText("wikiusers", id, JSON.stringify(user), function(error){
    if (cb){
      cb();
    }
  });
}


function isEditor(username){
  if (editors["*"]){
    return true;
  }
  return editors[username.toLowerCase()];
}

function isReader(username){
  if (readers["*"]){
    return true;
  }
  return readers[username.toLowerCase()];
}