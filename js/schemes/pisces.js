/* global NexT, CONFIG */

var Affix = {
  init: function (element, options) {
    this.links = document.querySelector('.sidebar-links');
    this.element = element;
    this.offset = options || 0;
    this.affixed = null;
    this.unpin = null;
    this.pinnedOffset = null;
    this.checkPosition();
    window.addEventListener('scroll', this.checkPosition.bind(this));
    window.addEventListener('click', this.checkPositionWithEventLoop.bind(this));
    window.matchMedia('(min-width: 992px)').addListener(event => {
      if (event.matches) {
        this.offset = NexT.utils.getAffixParam();
        this.checkPosition();
      }
    });
  },
  getState: function (scrollHeight, height, offsetTop, offsetBottom) {
    let scrollTop = window.scrollY;
    let targetHeight = window.innerHeight;
    if (offsetTop != null && this.affixed === 'top') {
      if (document.querySelector('.content-wrap').offsetHeight < offsetTop) return 'top';
      return scrollTop < offsetTop ? 'top' : false;
    }
    if (this.affixed === 'bottom') {
      if (offsetTop != null) return this.unpin <= this.element.getBoundingClientRect().top ? false : 'bottom';
      return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : 'bottom';
    }
    let initializing = this.affixed === null;
    let colliderTop = initializing ? scrollTop : this.element.getBoundingClientRect().top + scrollTop;
    let colliderHeight = initializing ? targetHeight : height;
    if (offsetTop != null && scrollTop <= offsetTop) return 'top';
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom';
    return false;
  },
  getPinnedOffset: function () {
    if (this.pinnedOffset) return this.pinnedOffset;
    this.element.classList.remove('affix-top', 'affix-bottom');
    this.element.classList.add('affix');
    return (this.pinnedOffset = this.element.getBoundingClientRect().top);
  },
  checkPositionWithEventLoop() {
    setTimeout(this.checkPosition.bind(this), 1);
  },
  checkPosition: function () {
    // console.log(this.links)
    if (window.getComputedStyle(this.element).display === 'none') return;
    let height = this.element.offsetHeight;
    let { offset } = this;
    let offsetTop = offset.top;
    let offsetBottom = offset.bottom;
    let { scrollHeight } = document.body;
    let affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);
    if (this.affixed !== affix) {
      if (this.unpin != null) this.element.style.top = '';
      let affixType = 'affix' + (affix ? '-' + affix : '');
      let linksType = 'links' + (affix ? '-' + affix : '');
      this.affixed = affix;
      this.unpin = affix === 'bottom' ? this.getPinnedOffset() : null;
      this.element.classList.remove('affix', 'affix-top', 'affix-bottom');
      this.element.classList.add(affixType);
      this.links.classList.remove('links', 'links-top', 'links-bottom');
      this.links.classList.add(linksType);
      //补充
      let rulesLength = document.styleSheets[0].rules.length;
      if (document.styleSheets[0].rules[rulesLength - 1].selectorText == '.links') {
        document.styleSheets[0].deleteRule(rulesLength - 1);
      }
      document.styleSheets[0].addRule('.links', 'top:' + (this.element.clientHeight + 12) + 'px !important');
    }
    if (affix === 'bottom') {
      this.element.style.top = scrollHeight - height - offsetBottom + 'px';
    }
  }
};

NexT.utils.getAffixParam = function () {
  const sidebarOffset = CONFIG.sidebar.offset || 12;

  let headerOffset = document.querySelector('.header-inner').offsetHeight;
  let footerOffset = document.querySelector('.footer').offsetHeight;

  document.querySelector('.sidebar').style.marginTop = headerOffset + sidebarOffset + 'px';

  return {
    top: headerOffset,
    bottom: footerOffset
  };
};

document.addEventListener('DOMContentLoaded', () => {
  let element = document.querySelector('.sidebar-inner')
  Affix.init(element, NexT.utils.getAffixParam());
  //监听dom
  const options = {
    childList: true,
    attributes: true,
    subtree: true,
  }
  // 创建MutationObserver实例，返回一个观察者对象
  const mutation = new MutationObserver(function (mutationRecoards, observer) {
    let rulesLength = document.styleSheets[0].rules.length;
    if (document.styleSheets[0].rules[rulesLength - 1].selectorText == '.links') {
      document.styleSheets[0].deleteRule(rulesLength - 1);
    }
    document.styleSheets[0].addRule('.links', 'top:' + (element.clientHeight + 12) + 'px !important');
  })
  mutation.observe(element, options);
});
