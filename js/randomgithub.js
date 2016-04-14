(function(ns) {
  'use strict';

  $('#search').on('submit', function randomGithub(event) {
    event.preventDefault();

    localStorage.setItem('token', $('#api-key').val());
    var query = $('#query').val();

    ajaxGithub('search/repositories?q=' + query, localStorage.getItem('token'))
      .then( chooseRandomRepo )
      .then( chooseRandomCommit )
      .fail(function errorFromGithub(xhr) {
        console.log(xhr);
        if(xhr.status === 403){
          localStorage.setIten('token', null);
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
      chooseRandomCommit(data, msg, xhr, counter);
    } else if (randomCommit.author === null && counter > 4){
      addAuthorToUI('users have deleted themselves');
    } else {
      addAuthorToUI(randomCommit.author.login, randomCommit.author.avatar_url);
    }
  }

  function addAuthorToUI(author, avatar) {
    $('#contributors ul')
      .append($('<li>')
        .append(author)
        .append($('<img>').attr({src: avatar}))
      );
  }

})();
