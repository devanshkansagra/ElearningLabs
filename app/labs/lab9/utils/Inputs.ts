import * as d3 from 'd3';
import { Complex, InputFieldData } from './types';
import { convertToPolar } from './complexOperations';

// Callback type for input changes
export type InputChangeCallback = (event: Event, d: InputFieldData) => void;

export function createInputs(
  containerId: string,
  tableClass: string,
  inputClass: string,
  data: InputFieldData[],
  onInputChanged: InputChangeCallback
) {
  const inputDiv = d3.select(containerId);
  const table = inputDiv.append('table').attr('class', tableClass);
  table.style('font-size', '0.8rem');

  // Create table header
  const header = table.append('thead').append('tr');
  
  // R/X toggle button
  header.append('th')
    .append('button')
    .text('R/X')
    .style('font-size', '0.8rem')
    .attr('class', 'myButtonCurrentAndVoltagePanel')
    .on('click', function() {
      const tables = document.getElementsByClassName(tableClass);
      for (let i = 0; i < tables.length; i++) {
        (tables[i] as HTMLElement).style.display = 'none';
      }
    });
  
  header.append('th').text('R');
  header.append('th').text('X');

  // Create table body
  const tbody = table.append('tbody');

  const inputFields = tbody.selectAll('.' + inputClass)
    .data(data)
    .enter()
    .append('tr')
    .attr('class', inputClass);

  const underlinedSlash = String.fromCharCode(47) + '\u0332';

  // Add first column with input field labels
  inputFields.append('td')
    .text((d: InputFieldData) => `${d.key}: `)
    .attr('class', (d: InputFieldData) => d.key.charAt(0))
    .style('font-size', '1rem')
    .on('mouseenter', function(event: MouseEvent, d: InputFieldData) {
      const elementReal = document.getElementById(`${d.key}-real`);
      const elementImaginary = document.getElementById(`${d.key}-imaginary`);
      
      if (elementReal && elementImaginary) {
        const boundingBoxReal = elementReal.getBoundingClientRect();
        const boundingBoxImaginary = elementImaginary.getBoundingClientRect();

        const polar = convertToPolar(d.value, true);

        // Create tooltip for magnitude
        d3.selectAll('.' + tableClass)
          .append('div')
          .text(` ${polar.magnitude.toFixed(2)} `)
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('left', `${boundingBoxReal.x}px`)
          .style('top', `${boundingBoxReal.y}px`)
          .style('height', `${boundingBoxReal.height}px`)
          .style('width', `${boundingBoxReal.width}px`);

        // Create tooltip for angle
        d3.selectAll('.' + tableClass)
          .append('div')
          .text(` ${underlinedSlash}${polar.angle.toFixed(1)} `)
          .attr('class', 'tooltipUnderlined')
          .style('position', 'absolute')
          .style('left', `${boundingBoxImaginary.x}px`)
          .style('top', `${boundingBoxImaginary.y}px`)
          .style('height', `${boundingBoxImaginary.height}px`)
          .style('width', `${boundingBoxImaginary.width}px`);
      }
    })
    .on('mouseout', function() {
      d3.select('.tooltip').remove();
      d3.select('.tooltipUnderlined').remove();
    });

  // Add second column with real input fields
  inputFields.append('td')
    .append('input')
    .style('width', '50px')
    .attr('type', 'number')
    .attr('step', '0.01')
    .style('font-size', '1rem')
    .attr('value', (d: InputFieldData) => d.value.x.toFixed(3))
    .attr('placeholder', 'x')
    .attr('id', (d: InputFieldData) => `${d.key}-real`)
    .attr('class', function(d: InputFieldData) {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (!['A', 'B', 'C', '0', '1', '2'].includes(lastChar)) {
        return 'VAR';
      }
      if (d.key.length === 3) {
        return 'VAR';
      }
      return d.key.charAt(0);
    })
    .on('input', onInputChanged);

  // Add third column with imaginary input fields
  inputFields.append('td')
    .append('input')
    .style('width', '50px')
    .attr('type', 'number')
    .attr('step', '0.01')
    .style('font-size', '1rem')
    .attr('value', (d: InputFieldData) => d.value.y.toFixed(3))
    .attr('placeholder', 'y')
    .attr('id', (d: InputFieldData) => `${d.key}-imaginary`)
    .attr('class', function(d: InputFieldData) {
      const lastChar = d.key.charAt(d.key.length - 1);
      if (!['A', 'B', 'C', '0', '1', '2'].includes(lastChar)) {
        return 'VAR';
      }
      if (d.key.length === 3) {
        return 'VAR';
      }
      return d.key.charAt(0);
    })
    .on('input', onInputChanged);

  return inputDiv;
}

export function createInputsTopLeft(
  containerId: string,
  tableClass: string,
  inputClass: string,
  data: InputFieldData[],
  onInputChanged: InputChangeCallback
) {
  const inputDiv = d3.select(containerId);
  const table = inputDiv.append('table').attr('class', tableClass);
  table.style('font-size', '1rem');

  const tbody = table.append('tbody');

  const inputFields = tbody.selectAll('.' + inputClass)
    .data(data)
    .enter()
    .append('tr')
    .attr('class', inputClass);

  // Add first column with input field labels
  inputFields.append('td')
    .text(function(d: InputFieldData) {
      if (d.key !== 'Per100') {
        return ` ${d.key}:`;
      } else {
        return '%';
      }
    })
    .attr('class', (d: InputFieldData) => d.key);

  // Add second column with real input fields
  inputFields.append('td')
    .append('input')
    .style('width', '70px')
    .attr('type', 'number')
    .attr('step', '0.01')
    .attr('value', (d: InputFieldData) => d.value.x.toFixed(2))
    .attr('id', (d: InputFieldData) => `${d.key}-real`)
    .attr('class', (d: InputFieldData) => d.key)
    .style('font-size', '1rem')
    .style('text-align', 'end')
    .on('input', onInputChanged);

  return inputDiv;
}
