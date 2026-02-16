import { convertScalar, convertComplex } from './meteringBase.js';

const valueFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const angleFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
import * as d3 from 'd3'


export async function text_Vector(
  text,
  textdash,
  textdashangle,
  text_label,
  textdash_label,
  textdshangle_label,
  ps1,
  ps2,
  vec,
  label,
  v_before,
  equal_id,
  ampv,
  angv,
  amp,
  angl,
  v,
  t_d,
  t_a,
  t_dd,
  color,
  textdecov,
  equal,
  vis_number,
  font_size,
  type,
  corrector,
) {
  const needsZLabel = text_label.charAt(text_label.length - 1) === 'Z';

  const rjxFromScreen = async (pt) => {
    const origin = type === 'I' ? p0_I : p0;
    const [rePx, imPx] = fromScreenXY(pt, origin);
    const reSec = rePx / corrector;
    const imSec = imPx / corrector;
    const [re, im] = await convertComplex([reSec, imSec], type);
    const formatComponent = (val) => (Number.isFinite(val) ? valueFormatter.format(val) : '--');
    const sign = Number.isFinite(im) && im < 0 ? ' - j ' : ' + j ';
    const imag = Number.isFinite(im) ? Math.abs(im) : NaN;
    return `${formatComponent(re)}${sign}${formatComponent(imag)}`;
  };

  const vectorLabelText = needsZLabel
    ? `${type}${label}`
    : `${type}${label} = ${await rjxFromScreen(v)}`;

  const amplitudeValue = Number.isFinite(amp)
    ? await convertScalar(amp / corrector, type)
    : NaN;
  const amplitudeText = Number.isFinite(amplitudeValue)
    ? valueFormatter.format(amplitudeValue)
    : '--';

  textdecov = d3.select(v_before).text(`${type}${label}`)
    .style('font-family', 'sans-serif')
    .style('font-size', '11px')
    .style('font-weight', 'normal')
    .style('color', color)
    .style('text-align', 'right');
  equal = d3.select(equal_id).text('=')
    .style('font-family', 'sans-serif')
    .style('font-size', '11px')
    .style('font-weight', 'normal')
    .style('color', color)
    .style('text-align', 'center');

  text = vis_number.selectAll(`text.${text_label}`).data(ps1);
  textdash = d3.select(ampv).data(ps2);
  textdashangle = d3.select(angv).data(ps2);

  if (needsZLabel) {
    text.enter()
      .append('text')
      .attr('class', text_label)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .text(vectorLabelText);
  } else {
    text.enter()
      .append('text')
      .attr('class', text_label)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .text(vectorLabelText);
  }

  if (needsZLabel) {
    textdash.enter()
      .append('text')
      .attr('class', textdash_label)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .text(amplitudeText);

    textdashangle.enter()
      .append('text')
      .attr('class', textdshangle_label)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .text(` /${angleFormatter.format(angl)} º`);
  }

  if (needsZLabel) {
    text
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .text(vectorLabelText)
      .style('font-family', 'sans-serif')
      .style('font-size', `${font_size}px`)
      .style('font-weight', 'normal')
      .attr('transform', `translate(${v[0] + 20},${v[1] + 20})`)
      .style('font-color', color);
  } else {
    text
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .text(vectorLabelText)
      .style('font-family', 'sans-serif')
      .style('font-size', `${font_size}px`)
      .style('font-weight', 'normal')
      .attr('transform', () => {
        const origin = type === 'I' ? p0_I : p0;
        const [, imag] = fromScreenXY(v, origin);
        const offsetY = imag <= 0 ? -20 : 20;
        return `translate(${v[0]},${v[1] + offsetY})`;
      })
      .style('font-color', color);
  }

  if (needsZLabel) {
    textdash
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .text(amplitudeText)
      .style('font-family', 'sans-serif')
      .style('font-size', `${font_size}px`)
      .style('font-weight', 'normal')
      .style('text-align', 'right')
      .attr('transform', `translate(${t_d},${t_a})`)
      .style('color', color);

    textdashangle
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .text(` /${angleFormatter.format(angl)} º`)
      .style('font-family', 'sans-serif')
      .style('font-size', `${font_size}px`)
      .style('font-weight', 'normal')
      .style('text-align', 'left')
      .attr('transform', `translate(${t_dd},${t_a})`)
      .style('color', color);
  }
}

// The legacy text_Vector_butt implementation remains commented out for reference.
// It can be restored if the draggable vector annotation UI is reintroduced.
