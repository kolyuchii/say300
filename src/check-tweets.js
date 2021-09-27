const functions = require("firebase-functions");
const admin = require('firebase-admin');
const Twitter = require('twitter');
const {TWITTER_CONFIG} = require('./config');
const db = admin.database();
const client = new Twitter(TWITTER_CONFIG);
const SEARCH_PARAMS = {
    q: '#say300',
    result_type: 'recent',
    count: 100,
};

exports.checkTweets = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
    console.log('RUN SCRIPT');

    // Attempt to retrieve the last tweet id
    const ref = db.ref("data/lastTweetId");
    await ref.once("value", snapshot => {
        const lastTweetId = snapshot.val();

        console.log('LAST TWEET ID ', lastTweetId);

        if (lastTweetId.length > 0) {
            SEARCH_PARAMS.since_id = lastTweetId;
        }
    }, errorObject => {
        console.log("The read failed: " + errorObject.code);
    });

    console.log('SEARCH TWEETS', SEARCH_PARAMS);

    client.get('search/tweets', SEARCH_PARAMS, (error, tweets, response) => {
        console.log('RECEIVED TWEETS', tweets.statuses);

        if (Array.isArray(tweets.statuses) && tweets.statuses.length > 0) {

            // Save the last found tweet id
            db.ref().update({
                data: {
                    lastTweetId: tweets.statuses[0].id_str
                }
            });

            // Send replays for each particular tweet
            tweets.statuses.forEach(status => {
                makeReply(status.id_str, status);
            });
        }
    });
});

/**
 * @param {string} tweetId
 * @param {object} status
 */
function makeReply(tweetId, status) {
    const params = {
        status: say300(),
        in_reply_to_status_id: String(tweetId),
        auto_populate_reply_metadata: true,
    };

    client.post('statuses/update', params, (error, tweet) => {
        if (!error) {
            console.log('SUCCESS ', tweet);
        } else {
            console.warn('ERROR ', error, status);
        }
    });
}

function say300() {
    const arrayOfRhymes = [
        'авантюриста', 'артиллериста', 'афериста', 'бандуриста', 'барьериста', 'беллетриста',
        'буериста', 'бульдозериста', 'волюнтариста', 'гитариста', 'грейдериста', 'декабриста',
        'домриста', 'жанриста', 'интуриста', 'кавалериста', 'каламбуриста', '(под)канцеляриста',
        'карикатуриста', 'карьериста', 'колориста', 'контроллериста', 'лейбориста', 'литавриста',
        'мануфактуриста', 'маньериста', 'мемуариста', 'гидрометриста', 'радиометриста',
        'секундометриста', 'тензометриста', 'фотометриста', 'хронометриста', '(анти)милитариста',
        'миниатюриста', 'монтекристо', '(электро)моториста', 'мрамориста', 'октябриста', 'панегириста',
        'планериста', 'пленэриста', 'прожекториста', 'прокуриста', 'пуриста', 'рапириста', 'ригориста',
        'семинариста', 'скрепериста', 'скутериста', 'сценариста', 'террориста', 'тракториста',
        'туриста', 'утилитариста', 'фактуриста', 'фанфариста', 'фигуриста', 'флориста',
        'фольклориста', 'фурьериста', 'футуриста', 'хориста', 'центриста', 'эгалитариста',
        'эгофутуриста', 'эгоцентриста', 'эквилибриста', 'юмориста', 'юриста', 'программиста', 'джаваскриптиста',
        'протоколиста', 'пхписта', 'питониста', 'хаскелиста', 'сишарписта', 'джависта', 'датасайентиста',
        'Senior Full Stack программиста', 'горниста', 'трубочиста', 'Windows Vista', 'активиста',
        'феминиста', 'хоббиста', 'бариста', 'танкиста', 'дизелиста', 'велосипедиста', 'мотоциклиста',
        'путиниста', 'Аблеева', 'фашиста', 'империалиста', 'контрабандиста', 'монархиста', 'евангелиста', 'рецидивиста',
        'материалиста', 'буддиста', 'гимназиста', 'пессимиста', 'романиста', 'парашютиста', 'анархиста', 'стилиста',
        'радиста', 'экономиста', 'лоббиста', 'садиста', 'связиста', 'хоккеиста', 'альпиниста', 'сепаратиста', 'гуманиста',
        'марксиста', 'нациста', 'социалиста', 'лингвиста', 'кинематографиста', 'фетишиста', 'иллюзиониста', 'альтруиста',
        'пародиста', 'геодезиста', 'фаталиста', 'скандалиста', 'вокалиста', 'мониста',
        'теннисиста', 'самбиста', 'металлиста', 'лицеиста', 'гедониста', 'массажиста', 'медалиста',
        'логиста', 'аквалангиста', 'моралиста', 'волейболиста', 'баяниста', 'реалиста', 'идеалиста', 'эгоиста',
        'пропагандиста', 'коммуниста', 'экстремиста', 'националиста',
        'автомобилиста', 'атеиста', 'капиталиста', 'артиста',
        'каратиста', 'реконкиста', 'машиниста', 'оптимиста', 'финансиста', 'шахматиста', 'публициста',
        'таксиста', 'пианиста', 'солиста', 'чекиста', 'монополиста', 'журналиста', 'футболиста',
        'специалиста', 'министра', 'магистра', 'премьер-министра', 'кациста', 'навальниста',
    ];

    const rand = Math.floor(Math.random() * arrayOfRhymes.length);
    return 'Отсоси у ' + arrayOfRhymes[rand];
}
