import Vue from 'vue'
import temp from '@/components/temp'

describe('temp.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(temp)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.message__text').textContent).toEqual('PWR')
  })
})
