import frp from 'frpjs'
import dom from 'frpjs/dom'

// Example 1: Clear
{
    const clear$ = frp.compose(
        dom.createEventStream('#ex1-button', 'click'),
        frp.map(event => '')
    )

    clear$(text => dom.select('#ex1-input').value = text)
}

// Example 2: Copy
{
    const copy$ = frp.compose(
        dom.createEventStream('#ex2-input', 'input'),
        frp.map(event => event.target.value)
    )

    copy$(text => dom.select('#ex2-label').textContent = text)
}

// Example 3: Reverse
{
    const copy$ = frp.compose(
        dom.createEventStream('#ex3-input', 'input'),
        frp.map(event => event.target.value),
        frp.map(text => text.split('').reverse().join(''))
    )

    copy$(text => dom.select('#ex3-label').textContent = text)
}

// Example 4: Count
{
    const count$ = frp.compose(
        dom.createEventStream('#ex4-button', 'click'),
        frp.map(event => 1),
        frp.fold((accum, curr) => accum + curr, 0)
    )

    count$(count => dom.select('#ex4-label').textContent = count)
}

// Example 5: Step
{
    const add$ = frp.compose(
        dom.createEventStream('#ex5-addBtn', 'click'),
        frp.map(event => +1)
    )
    const sub$ = frp.compose(
        dom.createEventStream('#ex5-subBtn', 'click'),
        frp.map(event => -1)
    )
    const count$ = frp.compose(
        add$,
        frp.merge(sub$),
        frp.fold((accum, curr) => accum + curr, 0)
    )

    count$(count => dom.select('#ex5-label').textContent = count)
}

// Example 6: Hold
{
    const red$ = frp.compose(
        dom.createEventStream('#ex6-redBtn', 'click'),
        frp.map(event => 'red')
    )
    const green$ = frp.compose(
        dom.createEventStream('#ex6-greenBtn', 'click'),
        frp.map(event => 'green')
    )
    const color$ = frp.compose(
        red$,
        frp.merge(green$)
    )

    const colorValue = frp.stepper(color$, null)
    color$(color => dom.select('#ex6-label').textContent = frp.snapshot(colorValue))
}

// Example 7: Encrypt
{
    const input$ = frp.compose(
        dom.createEventStream('#ex7-input', 'input'),
        frp.map(event => event.target.value)
    )
    const inputValue = frp.stepper(input$, 'Hello')
    const click$ = dom.createEventStream('#ex7-button', 'click')

    click$(click => dom.select('#ex7-label').textContent = rot13(frp.snapshot(inputValue)))

    function rot13(string) {
        return string.replace(/[a-zA-Z]/g, function (c) {
            return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);
        })
    }
}

// Example 8: Add
{
    const input1$ = frp.compose(
        dom.createEventStream('#ex8-input1', 'input'),
        frp.map(event => event.target.value),
        frp.map(value => parseInt(value))
    )
    const input2$ = frp.compose(
        dom.createEventStream('#ex8-input2', 'input'),
        frp.map(event => event.target.value),
        frp.map(value => parseInt(value))
    )
    const inputs$ = frp.compose(
        input1$,
        frp.merge(input2$)
    )
    const totalValue = frp.liftN(
        (a, b) => a + b, 
        frp.stepper(input1$, 5), 
        frp.stepper(input2$, 10)
    )

    inputs$(input => dom.select('#ex8-label').textContent = frp.snapshot(totalValue))
}