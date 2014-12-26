"use strict";
/*	
	*****************************************************************
	*	Site Name	:	https://platzi.firebaseio.com/				*
	*	Author		:	Cesar Anton Dorantes	reicek@gmail.com	*
	*	Version		:	0.1											*
	*****************************************************************
*/
(function()
{
	var firebaseUrl	= "https://platzi.firebaseio.com/objectives"	// Your firebase DB URL

	var Platzi	= angular.module('Platzi',
		[
			'ngRoute',
			'firebase',
			'directive.g+signin'
		]
	);
	Platzi.config(function($routeProvider) 
	{
		$routeProvider.
		when('/okr',							
		{
			controller	: 'okr_controller',
			templateUrl	: 'components/okr/okr.html'
		}).
		otherwise(							
		{
			redirectTo	:'/okr'
		});
	});
//	*****************************************************************
//	*	Data factories
//  *		Conect to Data Source
//	*		Share data between controllers
//	*****************************************************************
	Platzi.factory("colors_factory", function() 
	{
		var colors	= [];
			colors .push({'name':'red'});
			colors .push({'name':'pink'});
			colors .push({'name':'purple'});
			colors .push({'name':'deepPurple'});
			colors .push({'name':'indigo'});
			colors .push({'name':'blue'});
			colors .push({'name':'lightBlue'});
			colors .push({'name':'cyan'});
			colors .push({'name':'teal'});
			colors .push({'name':'green'});
			colors .push({'name':'lightGreen'});
			colors .push({'name':'lime'});
			colors .push({'name':'yellow'});
			colors .push({'name':'amber'});
			colors .push({'name':'orange'});
			colors .push({'name':'deepOrange'});
			colors .push({'name':'brown'});
			colors .push({'name':'grey'});
			colors .push({'name':'blueGrey'});
			
			return colors;
	});
	Platzi.factory("okrObjectives_factory", function($firebase) 
	{
		var ref		= new Firebase(firebaseUrl);
		var sync 	= $firebase(ref);
		
		return sync.$asArray();
	});
	Platzi.factory("user_factory", function() 
	{
		var user	= {};

		return user;
	});
//	*****************************************************************
//	*	Controllers
//  *		Used for logic and Dom data inyection
//	*****************************************************************
	Platzi.controller('plusLogin_controller',	function($scope, $rootScope, $http, user_factory)
	{
		$('article').css('display','none');										//	Hide dynamic content
		$scope.$on('event:google-plus-signin-success',	function (event,	authResult)
		{																		//	User successfully authorized the G+ App!
//			console.log(event);
			$('.signinButton')	.css('display','');								// Show dinamic content after user login
			gapi.client.load('plus', 'v1', function()
			{
				var request	= gapi.client.plus.people.get(
				{
					'userId':'me'
				});
				request.execute(function(resp)
				{
//					console.log(resp);
					user_factory.name		= resp.displayName;
					user_factory.picture	= (resp.image.url).replace("=50", "=100");
					user_factory.emails		= resp.emails;
					user_factory.id			= resp.id;
					
					console.log('___________________');	
					console.log('User Logged:');	
					console.log(user_factory);
					console.log('___________________');	
					
					$rootScope.$broadcast('event:authorized-user-login');
					$('article')				.css('opacity','1');
					
					$('article').css('display','');
					$('platzi-header-dash')		.css('width','90%');
					$('header .brand')			.css('right','85%');
					$('header #userName')		.html(user_factory.name);
					$('header #userName')		.css('opacity','1');
					$('header #userImg')		.attr('src',user_factory.picture);
					$('header #userImg')		.css('opacity','1');
				});
			});
		});
		$scope.$on('event:google-plus-signin-failure', function (event, authResult)
		{										
			console				.log('Error in sign in flow.'); 
			console				.log(authResult);								// User has not authorized the g+ App!
			
			$('.signinButton')	.css('display','block');
			$('#userImg')		.html = '';
			$('.userName')		.text = '';
		});
	});
	Platzi.controller('okr_controller',	function($scope,$firebase,okrObjectives_factory,user_factory,colors_factory)
	{
		$scope.board				= [];
		$scope.board['header']		= '';
		$scope.board['message']		= '';
		$scope.colors				= colors_factory;
		$scope.objectives			= okrObjectives_factory;
		$scope.objectives.$loaded().then(function() 
		{
			console.log('___________________');	
			console.log("ORKs loaded:");
			console.log($scope.objectives)
			console.log('___________________');	
		});
		$scope.showBoard		= function(board_title,data,property)
		{
			console.log('___________________');	
			console.log('Show board "'+board_title+'":')
			console.log('Data:')
			console.log(data);	
			
			switch(board_title)
			{
				case 'New Objective':
					$scope.board['header']					= 'New Objective';
					$scope.newObjective						= {};
						$scope.newObjective['since']		= Date.now();
						$scope.newObjective['by']			= user_factory.name;
						$scope.newObjective['keyResults']	= [];
					$('#platzi-board-newObjective')			.css('z-index','200');
					$('#platzi-board-newObjective')			.css('opacity','1');
					break;

				case 'Add Key Result':
					$scope.board['header']					= board_title;
					$('#platzi-board-addKeyResult')			.css('z-index','200');
					$('#platzi-board-addKeyResult')			.css('opacity','1');
					break;

				case 'Objective details':
					$scope.board['header']					= board_title;
					$scope.objective						= data;
					$('#platzi-board-objectiveDetails')		.css('z-index','200');
					$('#platzi-board-objectiveDetails')		.css('opacity','1');
					break;

				case 'Edit Key Result':
					$scope.board['header']					= board_title;
					$scope.objective 						= data;
					$scope.keyResult 						= property;
					$scope.keyResult.deadline				= new Date($scope.keyResult.deadline);
					$('#platzi-board-editKeyResult')		.css('z-index','200');
					$('#platzi-board-editKeyResult')		.css('opacity','1');
					break;

				default:
					break;
			}
			console.log('___________________');
		};
		$scope.hideBoard		= function()
		{
			console.log('Board hidden.');

			$('platzi-board')			.css('z-index','-1');
			$('platzi-board')			.css('opacity','0');
			$scope.board['header']		= '';
			$scope.board['message']		= '';
		};
		$scope.addObjective		= function(objective)
		{
			console.log('___________________');	
			console.log('Adding new objective from:');	
			console.log(objective);
			
			$scope.objectives
				.$add($scope.newObjective)
				.then(function ()
				{
					$scope.hideBoard();

					console.log('New Objective -'+objective.name+'- added');
					console.log('___________________');
				});
		};
		$scope.addKeyResult		= function(title,objective)
		{
			console.log('___________________');	
			console.log('Create new Key Result for:');	
			console.log(objective);
			console.log('___________________');	

			$scope.hideBoard();
			$scope.showBoard(title,objective);
			
			$scope.objective						= objective;
			
			$scope.newKeyResult						= {};
				$scope.newKeyResult['progress']			= 0;
				$scope.newKeyResult['since']			= Date.now();
				$scope.newKeyResult['by']				= user_factory.name;
		};
		$scope.addNewKeyResult	= function(objective, newKeyResult)
		{
			newKeyResult["deadline"] = new Date(newKeyResult.deadline).getTime();

			console.log('___________________');	
			console.log('Adding new Key Result:');
			console.log(newKeyResult);	
			console.log('Adding to Objective: '+objective.name);
			console.log('ID: '+objective.$id);
			
			var refSrc				= firebaseUrl+"/"+objective.$id+"/keyResults";
			var ref					= new Firebase(refSrc);
			var sync 				= $firebase(ref);
			var firebase_keyResults	=  sync.$asArray();
			
			firebase_keyResults
				.$add(newKeyResult)
				.then(function ()
				{
					$scope.hideBoard();

					console.log('New Key Result added');
					console.log('___________________');
				});
		};
		$scope.setObjectiveColor	= function(color)
		{
			console.log('___________________');
			console.log('Background color:');
			console.log(color);
			console.log('___________________');

			$scope.objective['color']	= color.name;
		};
		$scope.setNewObjectiveColor	= function(color)
		{
			console.log('___________________');
			console.log('Background color:');
			console.log(color);
			console.log('___________________');

			$scope.newObjective['color']	= color;
		};
		$scope.remove			= function(item)
		{
			$remove(item)
		};
		$scope.cancelObjectiveChanges	= function()
		{
			console.log('___________________');	
			console.log('Changes for '+$scope.objective.name+' cancelled.');
			console.log('___________________');	

			$scope.objectives[$scope.objective.$index]	= okrObjectives_factory;
			$scope.hideBoard();
		}
		$scope.saveObjectiveChanges		= function()
		{
			console.log('___________________');	
			console.log('Saving changes for '+$scope.objective.name);
			console.log($scope.objectives);

			$scope.objectives
				.$save($scope.objective)
				.then(function ()
				{
					$scope.hideBoard();

					console.log('Changes saved');
					console.log('___________________');	
				});
		}
		$scope.cancelKeyResultChanges	= function()
		{
			console.log('___________________');	
			console.log('Changes for '+$scope.keyResult.name+' cancelled.');
			console.log('___________________');	

			$scope.objectives[$scope.keyResult.$index]	= okrObjectives_factory;
			$scope.hideBoard();
		}
		$scope.saveKeyResultChanges		= function()
		{
			$scope.keyResult.deadline				= new Date($scope.keyResult.deadline).getTime();

			console.log('___________________');	
			console.log('Saving changes for '+$scope.keyResult.name);
			console.log($scope.keyResult);

			$scope.objectives
				.$save($scope.objective)
				.then(function ()
				{
					$scope.hideBoard();

					console.log('Changes saved');
					console.log('___________________');	
				});
		}
		$scope.removeObjective		= function()
		{
			$scope.objectives
				.$remove($scope.objective)
				.then(function ()
				{
					$scope.hideBoard();

					console.log('___________________');	
					console.log($scope.objective.name+' removed');
					console.log('___________________');	
				});
		}
	});
	return;
})();