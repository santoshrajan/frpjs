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

// Example 8: Add two numbers
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

// Example 9: Form validation
{
    // Validation functions
    const validators = {
        "name": function(value) {
            const name = value.trim()

            if (name.length == 0)
                return "Required"
            if (/([^A-Za-z\s])/.test(name))
                return "Cannot contains special characters"
            if (name.indexOf(' ') < 0)
                return "Please enter your full name"
            return ""
        },

        "quantity": function(value) {
            const number = parseInt(value)

            if (number < 1 || number > 3)
                return "Choose a number between 1 and 3"
            return ""
        },

        "email": function(value) {
            const email = value.trim()

            if (/\S+@\S+\.\S+/.test(email))
                return ""
            return "Please enter a valid email address"
        }
    }

    function allValidationsPassed(events) {
        let validations = []
        for(let key in events) {
            if (typeof events[key] == "object")
                validations.push(events[key].valid)
        }
        return validations.length == 3 &&
               validations.reduce((a, b) => a && b)
    }

    // Input stream
    const inputs$ = frp.compose(
        dom.createEventStream('#name', 'input'),
        frp.merge(dom.createEventStream('#email', 'change')),
        frp.merge(dom.createEventStream('#quantity', 'input')),

        frp.map(event => ({
            element: event.target,
            name: event.target.name,
            value: event.target.value,
            validator: validators[event.target.name]
        })),

        frp.map(event => {
            event.errorMessage = event.validator(event.value),
            event.valid = (event.errorMessage == "") ? true : false

            return event
        }),

        frp.fold((accumulator, currentEvent) => {
            accumulator[currentEvent.name] = currentEvent
            accumulator.current = currentEvent.name
            accumulator.allValid = allValidationsPassed(accumulator)

            return accumulator
        }, {})
    )

    // Activation
    inputs$(events => {
        const currentEvent     = events[events.current]
        const formGroupElement = currentEvent.element.parentElement
        const errorSpanElement = currentEvent.element.nextElementSibling

        if (currentEvent.valid == false) {
            dom.addClass(formGroupElement, 'has-error')
            errorSpanElement.textContent = currentEvent.errorMessage
        } else {
            dom.removeClass(formGroupElement, 'has-error')
            errorSpanElement.textContent = ""
        }

        dom.select('#submit').disabled = !events.allValid
    })
}