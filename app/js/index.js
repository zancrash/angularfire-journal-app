var app = angular.module("diaryApp", ["firebase"]);

app.constant('firebaseAuth', 'https://zandiaryapp-legacy.firebaseio.com');
app.constant('fbGroups', 'https://zandiaryapp-legacy.firebaseio.com/groups');
app.constant('fbMsg', 'https://zandiaryapp-legacy.firebaseio.com/entries');

//factory for auth
app.factory('auth', function(diaryService, $firebaseAuth) {
  return $firebaseAuth(diaryService.getAuth())
});

//factory for adding groups
app.factory("groupNames", ["$firebaseArray", "fbGroups", function($firebaseArray, fbGroups) {
  var ref = new Firebase(fbGroups);
  return $firebaseArray(ref);
}]);

//factory for adding entries
app.factory("entryContent", ["$firebaseArray", "fbMsg", function($firebaseArray, fbMsg) {
  var ref = new Firebase(fbMsg);
  return $firebaseArray(ref);
}]);

//controller for adding groups
app.controller('GroupCtrl', ['$scope', '$firebaseAuth', 'fbGroups', 'fbMsg', 'auth',  'diaryService', 'entryContent', 'groupNames', function($scope, $firebaseAuth, fbGroups, fbMsg, auth, diaryService, entryContent, groupNames) {
  console.log("GroupCtrl is online!");

  $scope.mygroups = groupNames;
  $scope.myentries = entryContent;
  $scope.selectedgroup = null;
  $scope.auth = auth;
  $scope.user = {};
  
  $scope.memberMessage="Not Registered?";
  $scope.buttonMessage="Login";
  $scope.authHead = "Login & Get Writing!"

  diaryService.getAuth().onAuth(function(userAuth) {
    console.log("user authenticated!");
    console.log(userAuth);
    if (userAuth) {
      $scope.loggedIn = true;
    } else {
      $scope.loggedIn = false;
    }
  })

  $scope.addGroup = function() {
    $scope.mygroups.$add({
      group: $scope.groupname
    });
    $scope.groupname = "";
  };

  $scope.removeGroup = function(groupname, myentries, entry, $index) {
    $scope.mygroups.$remove(groupname),
      //$scope.myentries.length = 0
    $scope.selectedgroup = null;
  }

  $scope.addEntry = function(selectedgroup) {
    $scope.myentries.$add({
      title: $scope.entrytitle,
      content: $scope.entrycontent,
      timestamp: Firebase.ServerValue.TIMESTAMP,
      group: $scope.selectedgroup
    });
    $scope.entry = "";
    
    $scope.addChild = function(entry, selectedgroup){      $scope.element(selectedgroup).append(entry);
    }
    $scope.addChild()
  };

  $scope.removeEntry = function(entry) {
    $scope.myentries.$remove(entry)
  }

  $scope.selectGroup = function(groupname, selectedgroup) {
    $scope.selectedgroup = groupname.group;
    console.log("group selected: " + selectedgroup);
  };

  //function for logging in
  $scope.login = function(ev) {
    var email = $scope.user.email;
    var password = $scope.user.password;
    $scope.auth.$authWithPassword({
      email: email,
      password: password
    }).then(function(user) {
      console.log("Logged into Firebase");
      console.log(user)
    }).catch(function(error) {
      console.log("You had an error: " + error)
      $scope.register();
    })
  }

  //function for registering
  $scope.register = function(ev) {
    var email = $scope.user.email;
    var password = $scope.user.password;
    $scope.auth.$createUser({
      email: email,
      password: password,
    }).then(function(user) {
      console.log("You've been registered!" + user);
      $scope.login();
    }).catch(function(error) {
      console.log("You had an error: " + error);
    })
  }

  $scope.logout = function(ev) {
    diaryService.getAuth().unauth();
  }

  $scope.newMember = function() {
    $scope.user.registered = !$scope.user.registered;
    $scope.buttonMessage = "Register";
    if (!$scope.user.registered) {
      $scope.memberMessage = "Login?";
      
    } else {
      $scope.memberMessage = "Not Registered?";
      $scope.buttonMessage = "Login";
    }
  }

}]);

app.service('diaryService', ['firebaseAuth', function(firebaseAuth) {
  var authRef = new Firebase(firebaseAuth)

  return {
    getAuth: function() {
      return authRef
    }
  }
}])