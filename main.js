const GAME_STATE = {
  FirstCardAwaits: "FirstCard",
  SecondCardAwaits: "SecondCard",
  CardsMatchFailed: "MatchFailed",
  CardsMatched: "CardMatch",
  GameFinished: "GameFinish"
}

const Symbols = [
  'https://harrypottertoengland.webnode.tw/_files/200000624-9f02b9ffcc/Gryffindorcrest.jpg', //葛萊//
  'https://harrypottertoengland.webnode.tw/_files/200000628-3a2723b212/Slytherincrest.jpg ',//史來哲林//
  'https://harrypottertoengland.webnode.tw/_files/200000626-21dd022d76/Hufflepuffcrest.jpg',//赫夫帕夫//
  'https://harrypottertoengland.webnode.tw/_files/200000627-81864827f6/Ravenclawcrest.jpg' //雷文克勞//
]


const view = {
  getCardElement(index) {
    return `<div class="card back" data-index=${index} ></div>`
  },

  getCardContent(index) {
    const cardnumber = this.transformNumber((index % 13) + 1)
    const cardsymbol = Symbols[Math.floor(index / 13)]
    return `    
      <p>${cardnumber}</p>
      <img src="${cardsymbol}" alt="">
      <p>${cardnumber}</p>`
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(INDEXS) {
    const rootElement = document.querySelector('#cards')
    //rootElement.innerHTML = utility.getRandomNumberArray().map(index => this.getCardElement(index)).join(" ");//
    rootElement.innerHTML = INDEXS.map(index => this.getCardElement(index)).join(" ")
  },

  //翻牌//
  flipCard(...Cards) {
    Cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        console.log(Number(card.dataset.index))
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  //成功時的樣子  
  pairCard(...Cards) {
    Cards.map(card => {
      card.classList.add('paired')
    })
  },
  //分數
  renderScore(score) {
    document.querySelector(".score").innerText = `分數：${score}`
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").innerText = `你已經試了第${times}次`
  },
  //動畫
  MoveWrongAnimation(...Cards) {
    Cards.map(card => {
      card.classList.add('wrong')
      console.log("動畫前", card)
      card.addEventListener('animationend', Items => {
        Items.target.classList.remove('wrong'), { once: true }
        console.log(Items.target.classList)
        console.log("動畫後", card)
      }
      )

    })
  },
  //score=260 完成//
  showGameFinished() {
    const showfinish = document.createElement('div')
    showfinish.classList.add('completed')
    showfinish.innerHTML = `
      <p>Complete!</p>
      <p> 總分: ${model.score}</p>
      <p> 總次數: ${model.triedTimes} 次 </p>
    `
    const header = document.querySelector('#header')
    header.before(showfinish)
  }

}
const model = {
  revealedCards: [],
  //判斷兩張是否相同 --->回傳 trun false//
  revealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0

}

//程式中所有動作應由 controller 統一發派//
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },


  CardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    console.log('card', card)
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCard(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)//次數+1

        view.flipCard(card)
        model.revealedCards.push(card)


        if (model.revealedCardsMatched()) {
          //配對成功
          view.renderScore(model.score += 10)

          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(...model.revealedCards)
          model.revealedCards = []

          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          } else {
            this.currentState = GAME_STATE.FirstCardAwaits
          }



        } else {
          //配對失敗//
          this.currentState = GAME_STATE.CardsMatchFailed
          view.MoveWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)  //1秒
        }
        break
    }

  },

  resetCards() {
    //view.flipCard(model.revealedCards[0])
    //view.flipCard(model.revealedCards[1])
    view.flipCard(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}



//洗牌公式//
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

//類array//
document.querySelectorAll('.card').forEach(item => {
  item.addEventListener('click', event => {
    //view.flipCard(item)
    controller.CardAction(item)
  })
})

