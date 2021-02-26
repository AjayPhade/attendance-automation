// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})();

function toMinutes(time) {
    time = time.split(':');

    return time[0] * 60 + parseInt(time[1]);
}

const date = new Date();

const time = new Intl.DateTimeFormat('en-in', {
    timeZone: 'Asia/Kolkata',
    timeStyle: 'short',
    hour12: false
}).format(date);

console.log('UTC/GMT:', date);

console.log('IST:', time);

console.log(toMinutes(time) > toMinutes('16:17'));

const times = ['09:00', '09:50', '10:50', '11:40'];

for (var i = times.length - 1; i >= 0; i--)
    if (toMinutes(time) > toMinutes(times[i])) {
        document.getElementById('time' + i).checked = true;
        // document.getElementById('time' + i).toggleAttribute('checked');
        break;
    }
