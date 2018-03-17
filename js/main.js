(function() {

  function Responsive() {
    this.isSmall = false
    this.subscribers = []
    this.onLayoutChange = (cb) => {
      this.subscribers.push(cb)
    }
    this.emit = () => {
      this.subscribers.forEach(s => {
        s.call()
      })
    }
    this.layoutChange = (e) => {
      if (window.innerWidth < 1000 || devicePixelRatio > 2.5) {
        window.document.documentElement.classList.add('sm')
        this.isSmall = true        
      }
      else {
        window.document.documentElement.classList.remove('sm')        
        this.isSmall = false        
      }
      this.emit()
    }

    this.initEvents()
  }

  Responsive.prototype.initEvents = function() {
    window.addEventListener('load', this.layoutChange)
    window.addEventListener('resize', this.layoutChange)
  }

  window.$responsive = new Responsive()

  function GridItem(el) {
    this.$el = el
    this.$shareWrapper = this.$el.querySelector('#share-wrapper')
    this.$shareAction = this.$el.querySelector('#share')
    this.shareMenuOpen = false
    this.initEvents()
  }

  GridItem.prototype.initEvents = function() {
    this.$shareAction.addEventListener('click', (e) => {
      e.preventDefault()
      this.$shareWrapper.classList.contains('open') ? 
        this.$shareWrapper.classList.remove('open')
        :
        this.$shareWrapper.classList.add('open')
    })
  }

  function Section(el, options) {
    this.$el = el
    this.options = options
    this.$grid = this.$el.querySelector('#grid')
    this.$backAction = this.$el.querySelector('#slide-left')
    this.$nextAction = this.$el.querySelector('#slide-right')
    this.gridItems = []
    this.setGridItems()
    this.calculateProperties()
    this.defineProperties()
    this.initEvents()
    this.setupImages()
    this.truncateBody()
    this.setSeparatorLength()
    this.render()
  }

  Section.prototype.setGridItems = function() {
    [].slice.call(this.$el.querySelectorAll('.grid--item')).forEach(item => {
      this.gridItems.push(new GridItem(item))
    })
  }

  Section.prototype.calculateProperties = function() {
    const numberOfColumns = this.$el.querySelectorAll('.grid-column').length
    const columnsPerPage = $responsive.isSmall ? this.options.smallColumnPerPage : this.options.columnPerPage     
    this.numberOfPages = Math.ceil(numberOfColumns / columnsPerPage)
  }

  Section.prototype.defineProperties = function() {
    let offset = 0
    Object.defineProperty(this, 'offset', {
      get() {
        return offset
      },
      set(newValue) {
        offset = newValue
        this.render()
      }
    })
  }

  Section.prototype.initEvents = function() {
    this.$backAction.addEventListener('click', (e) => {
      this.move(e, 'back')
    })
    this.$nextAction.addEventListener('click', (e) => {
      this.move(e, 'next')
    })

    $responsive.onLayoutChange(() => {
      this.calculateProperties()
      this.updateHeader()
    })
  }

  Section.prototype.setupImages = function() {
    [].slice.call(this.$grid.querySelectorAll('.grid--item')).forEach((item) => {
      const gridItemImage = item.querySelector('.grid--item-image span')
      const url = gridItemImage.getAttribute('data-image-url')
      gridItemImage.style.backgroundImage =  `url(${url})`
    })
  }

  Section.prototype.truncateBody = function() {
    [].slice.call(this.$grid.querySelectorAll('.grid--item-content-body')).forEach((item) => {
      let body = item.innerHTML
      const maxBodyLength = (this.options.maxBodyLength || body.length)
      body = body.length >=  maxBodyLength ? `${body.slice(0, maxBodyLength)}...` : body
      item.innerHTML = body
    })
  }

  Section.prototype.setSeparatorLength = function() {
    const title = this.$el.querySelector('.section-header--title h4').innerHTML;
    [].slice.call(this.$el.querySelectorAll('.separator span')).forEach((item) => {
      item.style.width = `${10*title.length}px`
    })
  }

  Section.prototype.move = function(e, direction) {
    e.preventDefault()
    const inc = direction === 'back' ? -1 : 1
    this.offset += inc
  }

  Section.prototype.render = function() {
    this.updateGrid()
    this.updateHeader()
  }

  Section.prototype.updateGrid = function() {
    const marginRight = $responsive.isSmall ? this.options.marginSmallRight : this.options.marginRight
    const shiftBy = $responsive.isSmall ? 300 : 1000
    this.$grid.style.transform = `translateX(-${ (this.offset*shiftBy) + (this.offset*marginRight) }px)`
  }

  Section.prototype.updateHeader = function() {
    const isBackDisabled = this.offset === 0
    const isNextDisabled = this.offset === this.numberOfPages - 1
    console.log("Updating", this.numberOfPages)

    isBackDisabled ? this.$backAction.classList.add('disabled') : this.$backAction.classList.remove('disabled')
    isNextDisabled ? this.$nextAction.classList.add('disabled') : this.$nextAction.classList.remove('disabled')
  }

  window.Section = Section
})()