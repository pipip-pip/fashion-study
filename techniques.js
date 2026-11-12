/* Technique vocabulary and hand-authored cards.
 *
 * TECHNIQUES is the fixed vocabulary from the spec's skill tree: every feature
 * tagged on a garment is one of these, so labels stay consistent.
 *
 * CARDS holds the written technique cards (tiers 1 and 2, plus bias binding
 * because the Hong Kong seam needs it). To add a card, copy an entry in CARDS
 * and use the technique's id as the key.
 */

const TIERS = {
  1: 'Foundations',
  2: 'Seams and shaping',
  3: 'Edges and closures',
  4: 'Components',
  5: 'Advanced',
};

// [id, name, tier, prerequisites, typically seen in]
const CONSTRUCTION = [
  ['grainline', 'Grainline, cutting and marking', 1, [], 'Everything'],
  ['plain-seam', 'Plain seam and seam allowance', 1, [], 'Everything'],
  ['pressing', 'Pressing', 1, [], 'Everything'],
  ['seam-finishes', 'Basic seam finishes (zigzag, overlock, pinked)', 1, ['plain-seam'], 'Fast fashion, casualwear'],
  ['hand-stitches', 'Hand stitches (slip, catch, tack)', 1, [], 'Hems, linings'],
  ['hems', 'Hems (double-fold, blind)', 1, ['pressing', 'hand-stitches'], 'Skirts, trousers'],

  ['french-seam', 'French seam', 2, ['plain-seam'], 'Sheer blouses, silk'],
  ['flat-felled-seam', 'Flat-felled seam', 2, ['plain-seam'], 'Jeans, shirts'],
  ['hong-kong-seam', 'Hong Kong seam', 2, ['plain-seam', 'bias-binding'], 'Unlined jackets'],
  ['darts', 'Darts (bust, waist, French)', 2, ['plain-seam', 'pressing'], 'Bodices, fitted skirts'],
  ['curved-seams', 'Curved seams, clipping and notching', 2, ['plain-seam'], 'Necklines, princess seams'],
  ['gathers', 'Gathers and easing', 2, ['plain-seam'], 'Skirts, puff sleeves'],
  ['pleats-tucks', 'Pleats and tucks', 2, ['grainline', 'pressing'], 'Skirts, trousers, shirts'],
  ['interfacing', 'Interfacing', 2, ['pressing'], 'Collars, facings, waistbands'],

  ['facings', 'Facings', 3, ['curved-seams', 'interfacing'], 'Sleeveless tops, dresses'],
  ['bias-binding', 'Bias binding', 3, ['curved-seams'], 'Necklines, armholes'],
  ['waistbands', 'Waistbands', 3, ['interfacing'], 'Skirts, trousers'],
  ['centred-lapped-zip', 'Centred and lapped zips', 3, ['plain-seam', 'pressing'], 'Skirts, dresses'],
  ['invisible-zip', 'Invisible zip', 3, ['centred-lapped-zip'], 'Dresses, fitted skirts'],
  ['fly-front-zip', 'Fly-front zip', 3, ['centred-lapped-zip', 'waistbands'], 'Trousers, jeans'],
  ['buttonholes', 'Buttonholes and buttons', 3, ['interfacing'], 'Shirts, coats'],
  ['plackets', 'Plackets (continuous, tower)', 3, ['interfacing', 'buttonholes'], 'Shirt sleeves, necklines'],

  ['set-in-sleeve', 'Set-in sleeve', 4, ['gathers', 'curved-seams'], 'Shirts, jackets, dresses'],
  ['raglan-sleeve', 'Raglan sleeve', 4, ['curved-seams'], 'Sweatshirts, casual tops'],
  ['kimono-drop-shoulder', 'Kimono and drop shoulder', 4, ['plain-seam'], 'Oversized tops'],
  ['cuffs', 'Cuffs', 4, ['plackets', 'interfacing'], 'Shirts'],
  ['flat-collars', 'Flat collars (Peter Pan)', 4, ['curved-seams', 'interfacing'], 'Blouses, dresses'],
  ['shirt-collar', 'Shirt collar with stand', 4, ['flat-collars', 'buttonholes'], 'Shirts'],
  ['pockets', 'Pockets (patch, in-seam, slant)', 4, ['plain-seam', 'pressing'], 'Trousers, skirts, jackets'],

  ['princess-seams', 'Princess seams', 5, ['curved-seams', 'darts'], 'Fitted dresses, jackets'],
  ['welt-pockets', 'Welt and jetted pockets', 5, ['pockets', 'interfacing'], 'Tailored jackets, trousers'],
  ['bagged-lining', 'Bagged lining', 5, ['set-in-sleeve', 'facings'], 'Jackets, coats'],
  ['knit-construction', 'Knit construction (stretch seams, bands)', 5, ['seam-finishes'], 'T-shirts, activewear'],
  ['notched-lapel', 'Notched lapel and tailoring basics', 5, ['shirt-collar', 'interfacing'], 'Blazers, coats'],
  ['bound-buttonholes', 'Bound buttonholes', 5, ['buttonholes', 'welt-pockets'], 'Couture coats'],
];

// [id, name, tier, prerequisites, unlocks route]
const PATTERN = [
  ['reading-patterns', 'Reading commercial patterns', 1, [], 'Beginner'],
  ['measurements', 'Taking measurements', 1, [], 'All'],
  ['basic-blocks', 'Basic blocks (bodice, skirt, sleeve, trouser)', 2, ['measurements'], 'Intermediate'],
  ['dart-rotation', 'Dart rotation and pivot method', 2, ['basic-blocks'], 'Intermediate'],
  ['slash-and-spread', 'Slash-and-spread (adding fullness)', 3, ['dart-rotation'], 'Intermediate'],
  ['truing-seams', 'Seam allowance and truing seams', 3, ['basic-blocks'], 'Intermediate'],
  ['collar-sleeve-drafting', 'Collar and sleeve drafting', 4, ['slash-and-spread'], 'Advanced'],
  ['draping-basics', 'Draping basics', 4, ['grainline', 'basic-blocks'], 'Advanced'],
  ['drafting-from-measurements', 'Drafting from measurements', 5, ['collar-sleeve-drafting', 'draping-basics'], 'Advanced'],
];

const TECHNIQUES = [
  ...CONSTRUCTION.map(([id, name, tier, prerequisites, seenIn]) => ({ id, name, tier, track: 'construction', prerequisites, seenIn })),
  ...PATTERN.map(([id, name, tier, prerequisites, unlocks]) => ({ id, name, tier, track: 'pattern', prerequisites, unlocks })),
];

/* ---------- Sources ---------- */

const BOOKS = {
  pstd: {
    title: 'Professional Sewing Techniques for Designers',
    author: 'Julie Cole and Sharon Czachor',
    url: 'https://librarysupply.co.nz/shop/the-arts/design-industrial-and-commercial-arts-illustration/fashion-and-textile-design/professional-sewing-techniques-for-designers_176302',
  },
  couture: {
    title: 'Couture Sewing Techniques',
    author: 'Claire B. Shaeffer',
    url: 'https://www.powells.com/book/couture-sewing-techniques-revised-updated-9781600853357',
  },
};

// Videos and articles are search links on the vetted channels, not specific
// videos: paste the exact one you watched into the card once you've found a good one.
const yt = (channel, topic) => ({
  label: `${channel}: search "${topic}"`,
  url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${channel} ${topic}`),
});
const threads = (topic) => ({
  label: `Threads Magazine: search "${topic}"`,
  url: 'https://www.threadsmagazine.com/?s=' + encodeURIComponent(topic),
});
const sources = (topic, book = 'pstd') => ({
  book,
  videos: [yt('Professor Pincushion', topic), yt('Made to Sew', topic)],
  article: threads(topic),
});

/* ---------- Cards ---------- */

const CARDS = {
  'grainline': {
    what: 'Grain is the direction of the yarns in a woven fabric. The lengthwise grain (warp) runs parallel to the selvedge and is the most stable; the crosswise grain (weft) runs selvedge to selvedge and gives slightly; the true bias sits at 45° and stretches the most. The grainline arrow on a pattern piece tells you how to place it against those yarns.',
    why: 'A garment cut on grain hangs straight and behaves the same on both sides of the body. Cut off grain, side seams twist, hems dip and no amount of pressing fixes it. Accurate cutting and marking is also what makes every later step line up: notches match, darts land where they were drafted.',
    steps: [
      'Straighten the fabric: tear or pull a thread across the cut end, then fold selvedge to selvedge and check it lies flat without diagonal ripples.',
      'Lay out all pieces before cutting. Measure from each end of the grainline arrow to the selvedge; both distances must be equal.',
      'Respect "place on fold" edges, nap or one-way prints (all pieces facing the same direction) and pattern matching.',
      'Pin or weight inside the seam allowance and cut with long, smooth strokes, keeping the fabric flat on the table.',
      'Transfer every marking before unpinning: snip notches (about 3 mm into the allowance), and mark dart points and placement lines with chalk, tailor\'s tacks or tracing paper.',
    ],
    mistakes: [
      'Eyeballing the grainline instead of measuring both ends.',
      'Lifting the fabric off the table while cutting, which distorts the edge.',
      'Forgetting to flip a pattern piece when cutting single-layer, ending up with two left sides.',
      'Skipping notches and marks "to save time", then guessing at the machine.',
    ],
    fabrics: 'Stable wovens (calico, poplin) are forgiving. Slippery or loosely woven fabrics (chiffon, satin, viscose) shift off grain easily, so cut them in a single layer, often on paper. Knits have no true grain but have a direction of greatest stretch that must go around the body.',
    sources: sources('grainline cutting fabric'),
  },

  'plain-seam': {
    what: 'The basic seam: two pieces placed right sides together and joined with a line of straight stitching a set distance from the raw edge. That distance is the seam allowance. Industry allowances vary by position, commonly 1 cm on most seams and 6 mm on enclosed edges such as collars and facings; home patterns usually use 1.5 cm throughout.',
    why: 'Almost every other seam is a plain seam plus a finish or a fold, so consistent allowance and stitch quality here decide the fit and look of the whole garment. A seam sewn 2 mm too wide on eight panels takes over 3 cm out of the garment.',
    steps: [
      'Match raw edges and notches, right sides together. Pin at right angles to the edge or hold without pins on stable fabric.',
      'Check stitch length (about 2.5 mm for medium wovens) and test tension on a scrap of the same fabric, two layers.',
      'Line the raw edge up with the correct guide on the needle plate and watch the guide, not the needle.',
      'Backstitch a few stitches at the start and end, or tie off threads on fine fabric.',
      'Press the seam flat as sewn to set the stitches, then press it open (or to one side, as the design needs).',
    ],
    mistakes: [
      'Watching the needle so the allowance wanders.',
      'Pulling or pushing the fabric instead of letting the feed dogs move it, which stretches one layer.',
      'Using the wrong allowance for the pattern (1.5 cm on a pattern drafted with 1 cm).',
      'Not testing stitch length and tension on a scrap first.',
    ],
    fabrics: 'Suits every woven. Match the needle to the fabric: fine (60–70) for lightweight, 80–90 for medium, 100+ for denim and canvas. Knits need a stretch stitch or overlocker instead, or the seam will pop.',
    sources: sources('plain seam seam allowance'),
  },

  'pressing': {
    what: 'Pressing is lifting the iron and setting it down with heat, steam and pressure to shape and set the fabric. It is different from ironing, which slides the iron back and forth to remove creases. In construction, each seam is pressed before it is crossed by another.',
    why: 'Pressing as you sew is the difference between "homemade" and professional. It melds stitches into the fabric, makes seams lie flat, shapes darts and curves to fit the body, and makes every following step more accurate.',
    steps: [
      'Test heat and steam on a scrap first, including any interfacing.',
      'Press the seam flat as it was sewn to set the stitches.',
      'Open the seam with your fingers or the tip of the iron, then press it open or to one side from the wrong side.',
      'Press shaped areas over a shaped surface: darts and curved seams over a tailor\'s ham, sleeve seams over a seam roll or sleeve board.',
      'Use a press cloth on the right side, and let the piece cool flat before moving it so the shape sets.',
    ],
    mistakes: [
      'Sliding the iron, which stretches bias and curved edges.',
      'Sewing across an unpressed seam; it can never be pressed properly afterwards.',
      'Pressing over pins or tacking, leaving marks.',
      'Too much heat on synthetics or pressing wool on the right side without a cloth, causing shine.',
    ],
    fabrics: 'Cotton and linen take high heat and steam. Wool wants steam, a cloth and a clapper. Silk needs a lower, mostly dry iron and can water-spot. Synthetics need low heat. Velvet and corduroy are pressed face down on a needle board or a spare piece of the same fabric so the pile is not crushed.',
    sources: sources('pressing techniques sewing'),
  },

  'seam-finishes': {
    what: 'A seam finish is a treatment applied to the raw edge of a seam allowance to stop it fraying and to make the inside of the garment tidy. The three basics are pinked (cut with zigzag shears), zigzagged (machine stitch over the edge) and overlocked (a three- or four-thread overlocker trims and wraps the edge in one pass).',
    why: 'Unfinished edges fray in wear and washing until the seam fails. The finish is also a quality signal: opening a garment and reading its seam finishes is one of the fastest ways to judge how it was made and at what price point.',
    steps: [
      'Sew and press the plain seam first.',
      'Decide whether the allowances are finished separately (seam pressed open) or together (seam pressed to one side; quicker, common in casualwear).',
      'Pinked: trim the edge with pinking shears; add a line of straight stitching 6 mm from the edge on fabrics that fray more.',
      'Zigzag: stitch so the right swing of the needle falls just off the raw edge. Test width and length on a scrap so the edge doesn\'t tunnel.',
      'Overlocked: feed the edge along the knife, trimming only a sliver. Secure the thread tails at the ends.',
      'Press again after finishing.',
    ],
    mistakes: [
      'Zigzagging a single thin layer with too wide a stitch, which rolls the edge into a ridge.',
      'Letting the overlocker knife cut into the seam allowance or the garment.',
      'Using a bulky finish on a fine fabric so it shows through on the right side.',
      'Finishing after the seam has been crossed by another, making it awkward to reach.',
    ],
    fabrics: 'Pinking only suits firmly woven fabrics that barely fray, and lined garments. Zigzag works on most light to medium wovens. Overlocking is the industry default for casualwear and for knits. For sheer or unlined garments, use an enclosed seam instead (French, flat-felled, Hong Kong).',
    sources: sources('seam finishes'),
  },

  'hand-stitches': {
    what: 'A small set of hand stitches covers most construction needs. Tacking (basting) is a long temporary running stitch that holds layers for fitting or machine sewing. The slip stitch joins a folded edge to another layer invisibly, with the thread travelling inside the fold. The catch stitch (herringbone) is a crossed stitch worked left to right that holds a hem or interfacing with a little give.',
    why: 'Hand stitches give control the machine can\'t: invisible hems, linings attached without a visible line, layers held exactly while fitting. They are standard in tailoring and couture and a quiet marker of quality in ready-to-wear.',
    steps: [
      'Use a single thread no longer than your forearm and a fine needle; start with a knot or a couple of small backstitches hidden in the allowance.',
      'Tacking: even running stitches about 1 cm long, sewn just inside the seam line so they can be pulled out later.',
      'Slip stitch: bring the needle out of the fold, pick up one or two threads of the garment directly opposite, then slide the needle 5–6 mm along inside the fold and repeat.',
      'Catch stitch: working left to right with the needle pointing left, take a tiny stitch in the garment, then a tiny stitch in the hem further right, so the threads cross.',
      'Keep the tension relaxed and finish with two small stitches on the spot inside the allowance.',
    ],
    mistakes: [
      'Pulling stitches tight, which dimples the right side.',
      'Picking up too much of the garment fabric so the stitch shows.',
      'Thread too long (it tangles and wears thin) or doubled where a single thread is neater.',
      'Leaving tacking in before pressing, which marks the fabric.',
    ],
    fabrics: 'Any, but they matter most where machine stitching would show or mark: wool suiting, silk, velvet, linings. The catch stitch suits knits and bias hems because it stretches. Use silk thread for tacking fine fabrics as it leaves no press marks.',
    sources: sources('hand stitches slip stitch catch stitch', 'couture'),
  },

  'hems': {
    what: 'A hem finishes the lower edge of a garment or sleeve by turning the raw edge to the inside. A double-fold hem turns the edge twice and is machine-stitched, so the stitching shows on the right side. A blind hem turns up a deeper allowance with a finished raw edge and attaches it by hand or with a blind-hem machine stitch, so almost nothing shows.',
    why: 'The hem sets the final length and affects how the garment hangs: a deeper hem adds weight and helps a skirt or trouser fall cleanly. The type of hem is a design decision that signals casual (topstitched) or tailored (invisible).',
    steps: [
      'Let bias-cut or circular garments hang for 24 hours first, then level the hem from the floor up.',
      'Mark the finished hemline and trim the allowance to an even depth: roughly 1–2 cm for curved hems, 3–5 cm for straight skirts and trousers.',
      'Double-fold: press up the full allowance, tuck the raw edge in to the crease, press again, then edgestitch close to the inner fold.',
      'Blind hem: finish the raw edge (overlock or tape), press up the hem, then fold the hem edge back a few millimetres and catch-stitch or slip-stitch between the layers, picking up one thread of the garment.',
      'Press from the wrong side, avoiding a hard ridge at the top of the hem.',
    ],
    mistakes: [
      'Hemming before the garment has been tried on and levelled.',
      'Too deep a hem on a curve, which ripples because the edge is longer than the place it folds up to (ease it in or make it narrower).',
      'Stitches pulled tight on a blind hem, showing as a row of dimples.',
      'Pressing the hem edge hard from the right side and leaving an imprint.',
    ],
    fabrics: 'Double-fold machine hems suit shirts, casual wovens and denim. Blind hems suit wool, suiting and dress-weight fabrics. Sheers want a narrow rolled or baby hem. Knits are hemmed with a twin needle or coverstitch so the hem stretches.',
    sources: sources('hems double fold blind hem'),
  },

  'french-seam': {
    what: 'An enclosed seam sewn in two passes: first with wrong sides together, then turned and sewn again with right sides together, trapping the raw edges inside a narrow tube. From the outside it looks like a plain seam; inside there are no raw edges.',
    why: 'It gives a clean, strong finish where the inside can be seen through the fabric or where an overlocked edge would look heavy. It is the classic seam for sheer and fine fabrics and a mark of quality in blouses and lingerie.',
    steps: [
      'With a 1.5 cm allowance: place the pieces wrong sides together and stitch 1 cm from the edge. (For 1 cm allowance, stitch at 5 mm and 5 mm.)',
      'Trim the allowance to about 3 mm and press the seam to one side, or open, to get a sharp turn.',
      'Fold along the seam so right sides are together, with the stitching exactly on the fold; press.',
      'Stitch 5 mm from the fold, enclosing the trimmed edges.',
      'Press the finished seam to one side (towards the back, by convention).',
    ],
    mistakes: [
      'Starting right sides together out of habit, which puts the seam on the outside.',
      'Not trimming closely enough, so "whiskers" of thread poke through the second row of stitching.',
      'Getting the two stitching widths wrong so the garment ends up bigger or smaller than drafted.',
      'Using it on tight curves, where the enclosed allowance can\'t spread and the seam puckers.',
    ],
    fabrics: 'Chiffon, georgette, organza, voile, lawn, fine silk. Too bulky for medium and heavy fabrics. Works best on straight or gently curved seams such as side seams and sleeve seams.',
    sources: sources('french seam'),
  },

  'flat-felled-seam': {
    what: 'A strong enclosed seam in which one allowance is trimmed, the other is folded around it, and the whole thing is stitched down flat, leaving two parallel rows of stitching on one side. It is the seam on the inside leg of jeans and the side seams of traditional shirts.',
    why: 'It is very hard-wearing, lies completely flat, and has no raw edges on either side, so it suits unlined, hard-worn garments and reversible pieces. The visible stitching is also a design feature.',
    steps: [
      'Decide which side the fell will show on. For the fold to sit on the outside (jeans style), sew a plain seam wrong sides together; for the inside (shirt style), right sides together.',
      'Press both allowances to one side.',
      'Trim the under allowance to about half its width (around 5–6 mm).',
      'Fold the wider allowance over the trimmed one, tucking its raw edge under, and press.',
      'Edgestitch close to the fold through all layers, keeping the row parallel to the first seam.',
    ],
    mistakes: [
      'Felling in the wrong direction so left and right sides of the garment don\'t mirror each other.',
      'Uneven trimming, giving a wavy second row of stitching.',
      'Skipping the press before the final stitch so the fold twists.',
      'Attempting it on a strongly curved seam (such as an armhole) without reducing the allowance first.',
    ],
    fabrics: 'Denim, drill, twill, shirting, canvas. Avoid on bulky fabrics (too many layers) and very fine or stretchy ones.',
    sources: sources('flat felled seam'),
  },

  'hong-kong-seam': {
    what: 'A seam finish in which each raw allowance of a plain seam is wrapped in a narrow bias strip. The strip is sewn to the allowance, wrapped over the raw edge to the underside, and held by stitching in the ditch; the strip\'s own raw edge stays flat underneath where it is not seen.',
    why: 'It gives a beautiful inside to unlined jackets, coats and skirts, where the seam allowances are on show. It adds less bulk than a full bound seam and is a signature of high-end and couture workrooms.',
    steps: [
      'Cut bias strips about 3 cm wide from a lightweight fabric (lining, silk habotai, cotton lawn).',
      'Sew the plain seam and press it open.',
      'Lay a strip on one allowance, right sides together, raw edges level, and stitch 6 mm from the edge without stretching the strip.',
      'Press the strip away from the allowance, wrap it over the raw edge to the underside, and press.',
      'From the top, stitch in the ditch (the groove of the first seam) to catch the strip underneath. Trim any excess strip on the underside.',
      'Repeat on the other allowance, then press the seam open again.',
    ],
    mistakes: [
      'Cutting the strips on the straight grain; they won\'t wrap smoothly, especially on curves.',
      'Stretching the bias strip as it is sewn, which makes the allowance ripple.',
      'Choosing a binding fabric that is too heavy, adding a ridge that shows on the right side.',
      'Catching the garment itself while stitching in the ditch.',
    ],
    fabrics: 'Medium to heavy fabrics in unlined garments: wool, linen, heavy cotton, denim, brocade. Bind with something thin and smooth. Not for sheers (use a French seam) or lightweight drapey fabrics.',
    sources: sources('hong kong seam finish', 'couture'),
  },

  'darts': {
    what: 'A dart is a stitched, tapering fold that takes fabric out at an edge and releases it at a point, turning flat cloth into a three-dimensional shape. Bust darts point to the fullest part of the bust; waist darts shape between waist and bust or hip; the French dart is a single long, often curved, dart running from the low side seam up towards the bust.',
    why: 'Darts are the basic unit of fit: they shape fabric over the bust, waist, hip and shoulder blade. They are also the starting point of pattern manipulation, since rotating a dart or converting it into a seam or gathers is how a basic block becomes a design.',
    steps: [
      'Mark the dart legs and the point accurately on the wrong side.',
      'Fold the dart right sides together, matching the legs exactly; pin across the dart.',
      'Stitch from the wide end to the point. Over the last centimetre, run the stitching right along the fold so it tapers to nothing.',
      'Do not backstitch at the point: leave long tails and tie a knot, or shorten the stitch length for the last few stitches.',
      'Press the dart flat as sewn, then over a ham: vertical darts towards the centre, horizontal darts downwards.',
    ],
    mistakes: [
      'Stopping abruptly or backstitching at the point, which leaves a dimple or bubble.',
      'A stitching line that bows outward instead of running straight (or in the drafted curve).',
      'Left and right darts of different lengths or angles.',
      'Pressing flat on the board rather than over a ham, flattening the shape the dart was made to create.',
    ],
    fabrics: 'Any woven. On thick fabrics, slash the dart open and press it flat to reduce bulk. On sheers the dart shows through, so sew it very neatly or convert it to gathers or a seam. Stretch knits usually don\'t need darts.',
    sources: sources('sewing darts'),
  },

  'curved-seams': {
    what: 'A curved seam joins edges that are not straight: either two matching curves (a neckline to its facing) or an inward curve to an outward curve (a princess seam). Because the seam allowance edge is a different length from the stitching line, the allowance has to be clipped (small snips on inward curves so it can spread) or notched (small wedges cut out of outward curves so it can overlap) before it will lie flat.',
    why: 'Curves are what make garments follow the body: necklines, armholes, princess seams, collars. Handling them correctly keeps the curve smooth and the same length it was drafted, with no puckers or pulled edges.',
    steps: [
      'Staystitch single curved edges just inside the seam line straight after cutting so they don\'t stretch.',
      'To join opposing curves, match notches first, pin frequently, and sew with the inward (concave) curve on top; clip it up to the staystitching where needed so it can spread to fit.',
      'Shorten the stitch length slightly on tight curves and stitch slowly, pivoting with the needle down if necessary.',
      'After stitching, clip inward-curved allowances and notch outward-curved allowances, stopping about 2 mm short of the stitching. Stagger the clips on each layer.',
      'Grade (trim layers to different widths) on enclosed seams, then press over a ham.',
    ],
    mistakes: [
      'Skipping staystitching, so the neckline or armhole grows before it is sewn.',
      'Clipping through the stitching.',
      'Too few clips, giving a seam that looks angular rather than curved once turned.',
      'Stretching one layer to make the edges match instead of matching the seam lines.',
    ],
    fabrics: 'Any, but loosely woven and bias-prone fabrics need staystitching most. On fabrics that fray badly, clip less and trim the allowance narrower instead.',
    sources: sources('curved seams clipping notching'),
  },

  'gathers': {
    what: 'Gathering draws a longer edge up into small, soft folds so it can be joined to a shorter one, adding visible fullness (a gathered skirt into a waistband, a puff sleeve head). Easing uses the same idea with much less difference in length, so the extra is absorbed without any visible folds (a set-in sleeve cap into an armhole).',
    why: 'Gathers add volume and movement as a design feature. Ease builds invisible shape and room, and it is what lets a flat sleeve fit over the curve of the shoulder.',
    steps: [
      'Lengthen the stitch (4–5 mm) and loosen the top tension slightly.',
      'Sew two parallel rows within the seam allowance, about 6 mm apart, one either side of the seam line or both just inside it. Leave long thread tails and don\'t backstitch.',
      'Divide both edges into quarters and match the marks, right sides together.',
      'Pull the bobbin threads from both ends, sliding the fabric along, until the edge fits; wind the tails round a pin in a figure of eight to hold.',
      'Distribute the fullness evenly, pin closely, and stitch on the seam line with the gathered side up, keeping the folds perpendicular to the seam.',
      'Remove any gathering thread that shows, and press the seam allowance only, never flattening the gathers themselves.',
    ],
    mistakes: [
      'Only one row of gathering stitches, which gives uneven folds that twist.',
      'Pulling the top thread instead of the bobbin thread, or snapping a thread halfway.',
      'Fullness bunched in some sections and sparse in others because the edges weren\'t divided and matched.',
      'Pressing over the gathers and flattening them into creases.',
    ],
    fabrics: 'Light to medium fabrics gather best: lawn, voile, challis, crepe, soft silks. A common ratio is 1.5 to 3 times the finished length, more for finer fabrics. Heavy or stiff fabrics gather bulkily, so use pleats instead.',
    sources: sources('gathering fabric easing'),
  },

  'pleats-tucks': {
    what: 'A pleat is a fold of fabric held at one end (and sometimes pressed along its length) that releases fullness in a controlled, structured way. Common types are knife pleats (all folded one way), box pleats (two folds turned away from each other) and inverted pleats (two folds meeting). A tuck is a fold stitched along part or all of its length, either decorative (pin tucks) or to release fullness at a set point (release tucks).',
    why: 'Pleats add room for movement while keeping a clean, tailored line: think trouser fronts, shirt backs under a yoke, pleated skirts. Tucks add texture and subtle shaping. Both are more structured alternatives to gathers.',
    steps: [
      'Mark every fold line and placement line accurately, on the right side for pleats pressed outward (use chalk or thread tracing that will come out).',
      'Fold each pleat along its fold line and bring it to its placement line, following the arrows on the pattern; pin.',
      'Check that pleat depth is even and that folds follow the straight grain where intended.',
      'Tack across the top within the seam allowance to hold the pleats. Tack down the length too if they will be pressed.',
      'Press (for crisp pleats, with a cloth and steam; for soft pleats, only at the top). Stitch part-way down or edgestitch the folds if the design calls for it.',
      'Attach the waistband, yoke or cuff, then remove the tacking.',
    ],
    mistakes: [
      'Folding pleats in the wrong direction (front trouser pleats and skirt pleats have conventions; follow the pattern).',
      'Marking inaccurately so the pleated edge no longer fits the waistband.',
      'Cutting off grain, so pleats twist and won\'t hang straight.',
      'Hemming after pleating instead of before on sharply pressed pleats, which makes a bulky, uneven hem.',
    ],
    fabrics: 'Crisp fabrics that hold a crease: wool suiting, cotton shirting, linen, polyester (which can be permanently heat-set). Soft, drapey fabrics give unpressed pleats that fall like folds. Very thick fabrics become bulky where pleats overlap.',
    sources: sources('pleats and tucks'),
  },

  'interfacing': {
    what: 'Interfacing is an extra layer applied to the wrong side of parts of a garment to add body, stability and strength. Fusible interfacing has a heat-activated adhesive and is bonded with an iron or press; sew-in interfacing is tacked or stitched in place. It comes woven, non-woven and knitted, in many weights.',
    why: 'It supports the areas that take strain or must hold a shape: collars, cuffs, waistbands, facings, button and buttonhole areas, pocket openings, hems of tailored jackets. Without it those areas stretch, collapse or wrinkle.',
    steps: [
      'Choose an interfacing slightly lighter than the fabric, with a similar structure (woven for wovens, knit for knits). Always fuse a test piece and check the handle and the right side.',
      'Cut it on the same grain as the garment piece. To reduce bulk, cut fusible interfacing without seam allowances or trim them after fusing, if the fabric allows.',
      'Place the adhesive (rough or shiny) side against the wrong side of the fabric, and cover with a press cloth.',
      'Press, don\'t iron: hold the iron in place with firm pressure for 10–15 seconds, lift, overlap and repeat. Follow the heat and steam the manufacturer specifies.',
      'Let the piece cool completely flat before moving it.',
    ],
    mistakes: [
      'Interfacing that is too heavy, making the area board-like.',
      'Sliding the iron and shifting or stretching the layers.',
      'Not enough heat, time or pressure, so it bubbles or peels after washing.',
      'Fusing with the adhesive side up and gluing it to the iron.',
      'Not pre-shrinking fabric (and some interfacings), so the layers shrink differently later.',
    ],
    fabrics: 'Most wovens take fusibles well. Use sew-in (often silk organza) for fabrics that can\'t take heat or would show glue: velvet, sequins, some sheers and textured fabrics. Use knit or stretch interfacing on knits so the area can still give where it needs to.',
    sources: sources('interfacing fusible sew-in'),
  },

  'bias-binding': {
    what: 'Bias binding is a strip of fabric cut on the true bias (45° to the selvedge), which lets it stretch and curve. It is used to enclose a raw edge so the binding shows as a narrow band, or turned fully to the inside as a bias facing so nothing shows on the outside.',
    why: 'It gives a neat, lightweight finish on curved edges such as necklines and armholes without the bulk of a separate facing. It can be a contrast design detail, and it is the basis of Hong Kong seams and other bound finishes.',
    steps: [
      'Cut strips on the true bias, four times the finished width plus a little for the turn of cloth. Join strips with diagonal seams on the straight grain and press them open.',
      'Staystitch the garment edge. For a bound edge, trim off the seam allowance first, since the binding wraps the raw edge rather than turning it.',
      'Sew the binding to the edge right sides together. Stretch it very slightly on inward curves (necklines, armholes) and ease it on outward curves.',
      'Press the binding up and over the edge to the inside, turning its raw edge under.',
      'Finish by stitching in the ditch from the right side, edgestitching, or slip-stitching by hand on the inside.',
    ],
    mistakes: [
      'Cutting strips off the true bias, so they twist and ripple.',
      'Stretching the binding too much, which makes the neckline pull in and cup.',
      'Leaving the full seam allowance on a bound edge, making the neckline tighter and higher than drafted.',
      'Uneven width because the wrap wasn\'t pressed before the final stitching.',
    ],
    fabrics: 'Make binding from light, stable but pliable fabrics: lawn, voile, silk, fine shirting, or the garment fabric itself if it is light enough. Avoid thick or stiff fabrics, which won\'t curve or fold cleanly.',
    sources: sources('bias binding neckline'),
  },
};
