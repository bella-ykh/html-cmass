window.addEventListener("message", (e) =>
{
    var msg = e.data;
    if (msg.type == 'viewer/translate')
    {
        GoogleTranslateManager.changeLang(msg.lang);
    }
});

class GoogleTranslateManager
{
    static lang = "";
    static changing = false;

    static init ()
    {
		document.body.classList.add('google-translate');
		// 새로운 div 요소를 생성하고 id와 style을 설정합니다
		var newDiv = document.createElement('div');
		newDiv.id = 'google_translate_element';
		newDiv.style.display = 'none';

		// 생성한 div 요소를 body에 추가합니다
		document.body.appendChild(newDiv);
		
        new google.translate.TranslateElement({
            pageLanguage: 'ko',
            autoDisplay: false
	}, 'google_translate_element');

        const observer = new MutationObserver(function(mutationsList)
        {
            for (let mutation of mutationsList)
            {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'lang' &&
                    mutation.target === document.documentElement)
                {
                    if (mutation.target.lang === 'auto')
                    {
                        GoogleTranslateManager.changeLang(GoogleTranslateManager.lang);
                    }
                    else
                    {
                        GoogleTranslateManager.lang = "";
                        GoogleTranslateManager.changing = false;
                    }
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }

    /** @param {string} lang 언어 코드 */
    static changeLang (lang)
    {
        GoogleTranslateManager.lang = lang;
        GoogleTranslateManager.changing = true;
		// 언어 선택 요소를 찾습니다
		var languageSelect = document.querySelector('.goog-te-combo');
		// 언어 값을 설정합니다
		languageSelect.value = lang;
		// 'change' 이벤트를 생성하고, 선택 요소에 디스패치합니다
		var event = new Event('change');
		languageSelect.dispatchEvent(event);
    }
}

// script 불러올때 이 함수명을 파라미터로 설정
function GoogleTranslateInitCallback ()
{
    GoogleTranslateManager.init();
}