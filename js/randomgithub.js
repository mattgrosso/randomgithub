(function(ns) {
  'use strict';

  function loadPreviousUsers(userObject) {
    var users = JSON.parse(userObject);
    var userKeys = Object.keys(users);
    userKeys.forEach(function add(each) {
      var contributor = { login: users[each].login, avatar: users[each].avatar_url };
      addAuthorToUI(contributor);
    });
  }

  loadPreviousUsers(localStorage.userList);

  $('#search').on('submit', function randomGithub(event) {
    event.preventDefault();

    localStorage.setItem('token', $('#api-key').val());
    var query = $('#query').val();

    ajaxGithub('search/repositories?q=' + query, localStorage.getItem('token'))
      .then( chooseRandomRepo )
      .then( chooseRandomCommit )
      .then( addAuthorToUI )
      .fail(function errorFromGithub(xhr) {
        console.log(xhr);
        if(xhr.status === 403){
          localStorage.setItem('token', null);
          addAuthorToUI('Token not valid. Please try again.');
        } else {
          addAuthorToUI('Data from Github not retrieved');
        }
      });
  });

  function ajaxGithub(url, token) {
    return $.ajax({
      type: 'GET',
      url: 'https://api.github.com/' + url,
      headers:{
        Authorization: 'token ' + token,
      },
      dataType: 'json'
    });
  }

  function chooseRandomRepo(data) {
    var randomNumber = Math.floor(Math.random() * data.items.length);
    var repo = data.items[randomNumber];
    return ajaxGithub('repos/' + repo.full_name + '/commits', localStorage.getItem('token'));
  }

  function chooseRandomCommit(data, msg, xhr, counter) {
    counter = counter || 1;
    var randomNumber = Math.floor(Math.random() * data.length);
    var randomCommit = data[randomNumber];
    if(randomCommit.author === null && counter < 5){
      counter ++;
      return chooseRandomCommit(data, msg, xhr, counter);
    } else if (randomCommit.author === null && counter > 4){
      return { login: null, avatar: null };
    } else {
      addAuthorToStorage(randomCommit.author.id, randomCommit.author.login, randomCommit.author.avatar_url);
      return { login: randomCommit.author.login, avatar: randomCommit.author.avatar_url };
    }
  }

  var users = {};

  function addAuthorToStorage(authorID, login, avatar) {
    users[contributor.authorid] = { login: contributor.login, avatar_url: contributor.avatar};
    localStorage.setItem('userList', JSON.stringify(users));
  }

  function addAuthorToUI(contributor) {
    if (contributor.login === null) {
      $('#contributors ul')
        .append($('<li>').append('users have deleted themselves'));
      return;
    }
    $('#contributors ul')
      .append($('<li>')
        .append(contributor.login)
        .append($('<img>').attr({src: contributor.avatar}))
      );
  }

  $('.clear').on('click', function clearStorage() {
    localStorage.clear();
    $('.contributors ul').empty();
  });
})();
