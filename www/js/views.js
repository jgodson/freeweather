var view = {
  viewList : [],
  index : 0,

  initialize : function() {
    var allViews = document.getElementsByClassName('view');
    for (var i = 0; i < allViews.length; i++) {
      this.viewList.push(allViews[i].id);
    }
  },

  moveLeft : function() {
    // Swipe Right
    var currentElement = document.getElementById(this.viewList[this.index]);
    if (this.viewList[this.index - 1] !== undefined) {
      currentElement.style.right = (+currentElement.style.right || 0) - 100 + '%';
      currentElement.classList.remove('inView');
      this.index--;
      document.getElementById(this.viewList[this.index]).classList.add('inView');
      document.getElementById(this.viewList[this.index]).style.right = 0;
    }
    else {
      currentElement.classList.add('jiggle');
      setTimeout(function() {
        currentElement.classList.remove('jiggle');
      }, 60)
    }
  },

  moveRight : function() {
    // Swipe Left
    var currentElement = document.getElementById(this.viewList[this.index]);
    if (this.viewList[this.index + 1] !== undefined) {
      currentElement.style.right = (+currentElement.style.right || 0) + 100 + '%';
      currentElement.classList.remove('inView');
      this.index++;
      document.getElementById(this.viewList[this.index]).classList.add('inView');
      document.getElementById(this.viewList[this.index]).style.right = 0;
    }
    else {
      currentElement.classList.add('jiggle');
      setTimeout(function() {
        currentElement.classList.remove('jiggle');
      }, 60)
    }
  }
}